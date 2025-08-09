import bcrypt from 'bcryptjs';

// Generate password hash for 'admin123'
const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
  } else {
    console.log('Password hash for "admin123":');
    console.log(hash);
    console.log('\nUse this hash in your database migration or seed script.');
  }
});
