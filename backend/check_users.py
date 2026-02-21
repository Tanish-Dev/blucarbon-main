import motor.motor_asyncio
import asyncio
import os
from dotenv import load_dotenv

async def check():
    load_dotenv()
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'blucarbon-backend')
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    count = await db.users.count_documents({})
    print(f"User count: {count}")
    
    if count > 0:
        users = await db.users.find({}).to_list(10)
        for u in users:
            print(f" - {u.get('username')} ({u.get('email')})")

if __name__ == "__main__":
    asyncio.run(check())
