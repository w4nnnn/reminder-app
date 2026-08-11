import * as dotenv from 'dotenv';
dotenv.config();

import { auth } from '../lib/auth'; // Ensure this points to your better-auth instance
import { db } from '../lib/db';
import { eq } from 'drizzle-orm';
import { user } from '../lib/schema';

const args = process.argv.slice(2);

if (args.length < 4) {
    console.error('❌ Usage: npm run create-user <name> <email> <password> <role>');
    console.error('Example: npm run create-user "John Doe" john@example.com mypassword123 admin');
    process.exit(1);
}

const [name, email, password, role] = args;

if (role !== 'admin' && role !== 'user') {
    console.error('❌ Role must be either "admin" or "user".');
    process.exit(1);
}

async function createUser() {
    try {
        console.log(`Creating ${role} user: ${name} (${email})...`);

        // Create the user using better-auth's API directly
        // This handles password hashing automatically and bypasses OTP if we mark email as verified
        const newUser = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
            }
        });

        if (newUser && newUser.user) {
            // Since email verification might be required in the auth config, 
            // we manually update the user to mark email as verified and set the role
            await db.update(user).set({
                emailVerified: true,
                role: role
            }).where(eq(user.id, newUser.user.id));
            
            console.log(`✅ Successfully created ${role} user: ${email}`);
        } else {
             console.error('❌ Failed to create user. Better-auth did not return user info.');
        }

    } catch (error: any) {
        if (error?.body?.message) {
           console.error(`❌ Error creating user: ${error.body.message}`);
        } else {
           console.error('❌ Error creating user:', error.message || error);
        }
    } finally {
        process.exit(0);
    }
}

createUser();
