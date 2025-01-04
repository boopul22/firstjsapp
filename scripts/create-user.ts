import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ywwqxdyuxzkqfdorrlnl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3d3F4ZHl1eHprcWZkb3JybG5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTc2NDIzMiwiZXhwIjoyMDUxMzQwMjMyfQ.d0_x2-YyEkgMQw7LK-LzkM6oWexB9v2UeK7jqYX0AWg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createInitialUser() {
  try {
    // First, check if user exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser.users.some(u => u.email === 'boopul123@gmail.com');

    if (userExists) {
      // Update user's email confirmation status
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users.find(u => u.email === 'boopul123@gmail.com');
      
      if (user) {
        await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true,
          user_metadata: { email_confirmed_at: new Date().toISOString() }
        });
        console.log('User email confirmed successfully');
      }
    } else {
      // Create new user with confirmed email
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'boopul123@gmail.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: { email_confirmed_at: new Date().toISOString() }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user returned from auth signup');
      }

      // Create the user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          username: 'boopul'
        }]);

      if (profileError) {
        throw profileError;
      }

      console.log('User created successfully');
    }

    console.log('Username: boopul');
    console.log('Password: admin123');
    console.log('Email: boopul123@gmail.com');
  } catch (error) {
    console.error('Error creating/updating user:', error);
  } finally {
    process.exit(0);
  }
}

createInitialUser(); 