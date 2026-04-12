# Google Sign-In Setup Guide

## ✅ Implementation Complete

Google Sign-In has been successfully added to your app! Follow these steps to configure it.

## 🔒 Security: Only Authorized Employees

**Important:** Only users who exist in your database can sign in with Google. This prevents unauthorized access.

### How It Works:
1. **New Google user tries to sign in** → ❌ Denied (shows "Access denied" message)
2. **Authorized employee in database** → ✅ Allowed to sign in
3. **Deactivated user** → ❌ Denied (shows "Account deactivated" message)

### Adding Authorized Users:

```bash
# Add an agent
npx tsx scripts/add-user.ts email@example.com "Employee Name" agent

# Add an admin
npx tsx scripts/add-user.ts email@example.com "Admin Name" admin

# List all users
npx tsx scripts/list-users.ts
```

### Example:
```bash
npx tsx scripts/add-user.ts john@company.com "John Smith" agent
npx tsx scripts/add-user.ts sarah@company.com "Sarah Johnson" admin
```

## 📋 What Was Changed

1. **Database Schema** - Added `Account` model to store OAuth connections
2. **Auth Configuration** - Added Google provider to NextAuth
3. **Login Page** - Added "Continue with Google" button
4. **Dependencies** - Installed `@auth/prisma-adapter`

## 🔧 Setup Steps

### 1. Create Google OAuth App (FREE)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "Google+ API" (in APIs & Services)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User Type: External
   - App name: PM Real Estate
   - User support email: your email
   - Developer contact: your email
   - Scopes: email, profile (default)
   - Test users: Add your Google account(s)

6. Create OAuth Client ID:
   - Application type: Web application
   - Name: PM Real Estate Login
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

7. Copy your **Client ID** and **Client Secret**

### 2. Add Environment Variables

Add to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 3. Configure NextAuth Secret

Add to `.env.local` if not already present:

```env
AUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret with:
```bash
openssl rand -base64 32
```

Or on Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4. Test the Implementation

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/admin/login`

3. Click "Continue with Google"

4. Sign in with your Google account

5. You'll be redirected to `/admin` dashboard

## 🎯 How It Works

### First-time Google Sign-In:
- User clicks "Continue with Google"
- Google authenticates the user
- A new `User` record is created automatically
- An `Account` record links the user to their Google account
- User is assigned `agent` role by default

### Returning Users:
- Google authenticates the user
- System finds existing user by email
- User is signed in automatically

### Password Field:
- Users who sign in with Google have `password: null`
- They can only authenticate via Google
- Email/password users can continue using credentials

## 🔒 Security Notes

- Google OAuth is completely free (no usage limits for basic auth)
- No business verification required for basic scopes
- SSL/HTTPS required in production
- Test users only in development mode (OAuth consent screen in testing)

## 🚀 Publishing (Optional)

To allow any Google user to sign in (not just test users):

1. Complete OAuth consent screen fully
2. Submit for verification (if needed)
3. Publish the app in Google Cloud Console

For internal company use, you can keep it in testing mode and just add test users.

## 📝 Next Steps

- Add user role management UI
- Consider adding more OAuth providers (GitHub, Microsoft)
- Implement user profile management
- Add option to link multiple auth methods

## ❓ Troubleshooting

**"Redirect URI mismatch" error:**
- Check that redirect URI exactly matches in Google Console
- Include `/api/auth/callback/google`

**"Access blocked" error:**
- Add yourself as a test user in OAuth consent screen
- Or publish the app for public use

**User created but can't access admin:**
- First Google sign-in creates user with `agent` role
- Update role to `admin` in database if needed:
  ```sql
  UPDATE "User" SET role = 'admin' WHERE email = 'your@email.com';
  ```
