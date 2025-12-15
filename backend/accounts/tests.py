from django.test import TestCase
from django.contrib.auth import get_user_model

from accounts.serializers import Admin_user

User = get_user_model()

class UserModelTest(TestCase):

    def test_create_user(self):
        user = Admin_user.objects.create_user(
            email="test@example.com",
            password="strongpassword123",
            first_name="Test",
            last_name="User",
        )

        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.first_name, "Test")
        self.assertEqual(user.last_name, "User")
        self.assertTrue(user.check_password("strongpassword123"))
