import connectdb from '../utils/connectdb.js';
import User from '../Schema/UserSchema.js';
import bcrypt from 'bcryptjs';

async function createInitialAdmin() {
    try {
        await connectdb();
        
        // Check if any admin already exists
        const existingAdmin = await User.findOne({ isAdmin: true });
        
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        // Create initial admin user
        const adminEmail = process.env.ADMIN_EMAIL || 'mandeep@developer.com';
        const adminPassword = process.env.ADMIN_PASSWORD || '12321';
        const adminName = process.env.ADMIN_NAME || 'Mandeep the Developer';

        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        const adminUser = new User({
            fullName: adminName,
            email: adminEmail.toLowerCase(),
            password: hashedPassword,
            isAdmin: true,
            status: 'active'
        });

        await adminUser.save();

        console.log('Initial admin user created successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('Please change the password after first login.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createInitialAdmin();