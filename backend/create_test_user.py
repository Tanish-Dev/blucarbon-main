import motor.motor_asyncio
import asyncio
import os
from passlib.context import CryptContext
from dotenv import load_dotenv

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create():
    load_dotenv()
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'blucarbon-backend')
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Try to delete existing test user if any
    await db.users.delete_one({"username": "test"})
    
    user = {
        "username": "test",
        "email": "test@example.com",
        "password": pwd_context.hash("password"),
        "full_name": "Test User",
        "role": "user",
        "is_active": True
    }
    await db.users.insert_one(user)
    print("Test user 'test' created with password 'password'")

if __name__ == "__main__":
    asyncio.run(create())
