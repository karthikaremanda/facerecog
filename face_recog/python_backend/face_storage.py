import os
import sqlite3
import numpy as np
import json
import base64

class FaceStorage:
    def __init__(self, db_path='face_database.sqlite'):
        """
        Initialize face storage with SQLite database
        
        Args:
            db_path (str): Path to SQLite database file
        """
        self.db_path = db_path
        self._create_tables()

    def _create_tables(self):
        """
        Create necessary tables in the database if they don't exist
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS registered_faces (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    embedding BLOB NOT NULL,
                    metadata TEXT,
                    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS face_images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    face_id INTEGER,
                    image_base64 TEXT NOT NULL,
                    FOREIGN KEY (face_id) REFERENCES registered_faces (id)
                )
            ''')
            conn.commit()

    def _serialize_embedding(self, embedding):
        """
        Serialize numpy embedding to base64 string
        
        Args:
            embedding (numpy.ndarray): Face embedding
        
        Returns:
            str: Base64 encoded embedding
        """
        return base64.b64encode(embedding.tobytes()).decode('utf-8')

    def _deserialize_embedding(self, serialized_embedding, dtype=np.float32):
        """
        Deserialize base64 string to numpy embedding
        
        Args:
            serialized_embedding (str): Base64 encoded embedding
            dtype (numpy.dtype): Data type of embedding
        
        Returns:
            numpy.ndarray: Deserialized embedding
        """
        return np.frombuffer(
            base64.b64decode(serialized_embedding.encode('utf-8')), 
            dtype=dtype
        )

    def register_face(self, name, embedding, images=None, metadata=None):
        """
        Register a new face in the database
        
        Args:
            name (str): Name associated with the face
            embedding (numpy.ndarray): Face embedding
            images (list, optional): List of base64 encoded images
            metadata (dict, optional): Additional metadata
        
        Returns:
            int: ID of the registered face
        """
        # Validate inputs
        if not isinstance(embedding, np.ndarray):
            raise ValueError("Embedding must be a numpy array")
        
        # Serialize embedding and metadata
        serialized_embedding = self._serialize_embedding(embedding)
        metadata_json = json.dumps(metadata) if metadata else None

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Insert face embedding
            cursor.execute('''
                INSERT INTO registered_faces 
                (name, embedding, metadata) 
                VALUES (?, ?, ?)
            ''', (name, serialized_embedding, metadata_json))
            
            # Get the ID of the inserted face
            face_id = cursor.lastrowid
            
            # Insert associated images if provided
            if images:
                image_data = [(face_id, img) for img in images]
                cursor.executemany('''
                    INSERT INTO face_images 
                    (face_id, image_base64) 
                    VALUES (?, ?)
                ''', image_data)
            
            conn.commit()
            return face_id

    def get_registered_faces(self):
        """
        Retrieve all registered faces
        
        Returns:
            list: List of registered faces with their details
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Retrieve faces with their images
            cursor.execute('''
                SELECT 
                    f.id, 
                    f.name, 
                    f.embedding, 
                    f.metadata, 
                    f.registration_date,
                    GROUP_CONCAT(i.image_base64) as images
                FROM registered_faces f
                LEFT JOIN face_images i ON f.id = i.face_id
                GROUP BY f.id
            ''')
            
            faces = []
            for row in cursor.fetchall():
                face = {
                    'id': row['id'],
                    'name': row['name'],
                    'embedding': self._deserialize_embedding(row['embedding']),
                    'metadata': json.loads(row['metadata']) if row['metadata'] else None,
                    'registration_date': row['registration_date'],
                    'images': row['images'].split(',') if row['images'] else []
                }
                faces.append(face)
            
            return faces

    def get_face_by_name(self, name):
        """
        Retrieve a specific face by name
        
        Args:
            name (str): Name of the face to retrieve
        
        Returns:
            dict or None: Face details if found
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT 
                    f.id, 
                    f.name, 
                    f.embedding, 
                    f.metadata, 
                    f.registration_date,
                    GROUP_CONCAT(i.image_base64) as images
                FROM registered_faces f
                LEFT JOIN face_images i ON f.id = i.face_id
                WHERE f.name = ?
                GROUP BY f.id
            ''', (name,))
            
            row = cursor.fetchone()
            if row:
                return {
                    'id': row['id'],
                    'name': row['name'],
                    'embedding': self._deserialize_embedding(row['embedding']),
                    'metadata': json.loads(row['metadata']) if row['metadata'] else None,
                    'registration_date': row['registration_date'],
                    'images': row['images'].split(',') if row['images'] else []
                }
            return None

    def delete_face(self, name=None, face_id=None):
        """
        Delete a registered face
        
        Args:
            name (str, optional): Name of the face to delete
            face_id (int, optional): ID of the face to delete
        
        Returns:
            bool: True if deletion was successful, False otherwise
        """
        if not name and not face_id:
            raise ValueError("Either name or face_id must be provided")

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            if name:
                cursor.execute('DELETE FROM registered_faces WHERE name = ?', (name,))
            else:
                cursor.execute('DELETE FROM registered_faces WHERE id = ?', (face_id,))
            
            conn.commit()
            return cursor.rowcount > 0

    def update_face(self, name, new_embedding=None, new_metadata=None, new_images=None):
        """
        Update an existing face registration
        
        Args:
            name (str): Name of the face to update
            new_embedding (numpy.ndarray, optional): New face embedding
            new_metadata (dict, optional): New metadata
            new_images (list, optional): New images to add
        
        Returns:
            bool: True if update was successful, False otherwise
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Find the face
            cursor.execute('SELECT id FROM registered_faces WHERE name = ?', (name,))
            result = cursor.fetchone()
            
            if not result:
                return False
            
            face_id = result[0]
            
            # Prepare update parameters
            update_fields = []
            update_values = []
            
            if new_embedding is not None:
                update_fields.append('embedding = ?')
                update_values.append(self._serialize_embedding(new_embedding))
            
            if new_metadata is not None:
                update_fields.append('metadata = ?')
                update_values.append(json.dumps(new_metadata))
            
            # Update face details if needed
            if update_fields:
                query = f'UPDATE registered_faces SET {", ".join(update_fields)} WHERE name = ?'
                update_values.append(name)
                cursor.execute(query, tuple(update_values))
            
            # Add new images if provided
            if new_images:
                image_data = [(face_id, img) for img in new_images]
                cursor.executemany('''
                    INSERT INTO face_images 
                    (face_id, image_base64) 
                    VALUES (?, ?)
                ''', image_data)
            
            conn.commit()
            return True

# Example usage
def main():
    # Initialize face storage
    storage = FaceStorage()
    
    # Example: Register a face
    import numpy as np
    sample_embedding = np.random.rand(512).astype(np.float32)
    storage.register_face(
        name='John Doe', 
        embedding=sample_embedding,
        metadata={'age': 30, 'occupation': 'Engineer'},
        images=['base64_encoded_image1', 'base64_encoded_image2']
    )
    
    # Retrieve registered faces
    registered_faces = storage.get_registered_faces()
    print("Registered Faces:", registered_faces)

if __name__ == '__main__':
    main()
