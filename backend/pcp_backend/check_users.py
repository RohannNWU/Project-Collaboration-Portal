#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pcp_backend.settings')
django.setup()

from django.conf import settings

def check_users():
    try:
        # Get all users from MongoDB
        users = list(settings.USERS_COLLECTION.find({}, {'email': 1, '_id': 0}))
        
        if users:
            print("Available users in MongoDB:")
            for user in users:
                print(f"- {user['email']}")
        else:
            print("No users found in MongoDB.")
            print("\nYou can create a new user by:")
            print("1. Using the registration endpoint: POST /api/register/")
            print("2. Or register through your frontend application")
            
    except Exception as e:
        print(f"Error accessing MongoDB: {e}")
        print("\nMake sure your MongoDB connection is working.")

if __name__ == "__main__":
    check_users()
