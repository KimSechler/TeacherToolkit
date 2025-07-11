# 🗄️ Database Setup Guide

## **Option 1: Neon Database (Recommended)**

### **Step 1: Create Neon Account**
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Create a new project

### **Step 2: Get Database URL**
1. In your Neon dashboard, click on your project
2. Go to "Connection Details"
3. Copy the connection string (looks like: `postgresql://user:password@host/database`)

### **Step 3: Set Environment Variable**
```bash
export DATABASE_URL="your-neon-connection-string"
```

Or create a `.env` file:
```bash
echo "DATABASE_URL=your-neon-connection-string" > .env
```

### **Step 4: Run Database Migrations**
```bash
npm run db:push
```

### **Step 5: Restart Server**
```bash
npm run dev
```

## **Option 2: Supabase Database**

### **Step 1: Create Supabase Account**
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project

### **Step 2: Get Connection String**
1. Go to Settings > Database
2. Copy the connection string

### **Step 3: Set Environment Variable**
```bash
export DATABASE_URL="your-supabase-connection-string"
```

### **Step 4: Run Migrations**
```bash
npm run db:push
```

## **Option 3: Local PostgreSQL**

### **Step 1: Install PostgreSQL**
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Or download from postgresql.org
```

### **Step 2: Create Database**
```bash
createdb teachertoolkit
```

### **Step 3: Set Environment Variable**
```bash
export DATABASE_URL="postgresql://localhost/teachertoolkit"
```

### **Step 4: Run Migrations**
```bash
npm run db:push
```

## **Verification**

After setup, test the database:

```bash
# Test connection
curl http://localhost:3000/api/classes

# Should return real data instead of mock data
```

## **Benefits of Real Database**

✅ **Data Persistence**: Data survives server restarts  
✅ **Proper Validation**: Zod schemas work correctly  
✅ **Real Testing**: Actual user testing conditions  
✅ **Production Ready**: Same setup as production  
✅ **Better Performance**: Optimized queries  
✅ **Data Integrity**: Foreign key constraints  

## **Troubleshooting**

### **Connection Issues**
- Check DATABASE_URL format
- Ensure database is accessible
- Verify network connectivity

### **Migration Issues**
- Run `npm run db:push` to create tables
- Check schema compatibility
- Verify database permissions

### **Performance Issues**
- Add database indexes
- Optimize queries
- Monitor connection pool 