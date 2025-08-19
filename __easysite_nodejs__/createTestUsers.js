function createTestUsers() {
    // This function will be called from the frontend to create test users
    // with proper role assignments
    
    const testUsers = [
        {
            email: 'administrator@test.com',
            password: 'admin123',
            name: 'Test Administrator',
            roleId: 434, // Administrator role
            phone_number: '+1-555-0100'
        },
        {
            email: 'contractor@test.com', 
            password: 'contractor123',
            name: 'Test Contractor',
            roleId: 433, // General User role
            phone_number: '+1-555-0101'
        }
    ];
    
    return {
        message: 'Test user credentials ready',
        users: testUsers.map(user => ({
            email: user.email,
            password: user.password,
            name: user.name,
            roleId: user.roleId
        }))
    };
}