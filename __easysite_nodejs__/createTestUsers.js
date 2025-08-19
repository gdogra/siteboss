function createTestUsers() {
  // Demo accounts with specific roles for Laguna Bay Development
  const testUsers = [
  {
    email: 'admin@lagunabay.dev',
    password: 'admin123',
    name: 'Administrator',
    roleId: 434, // Administrator role
    phone_number: '+1-555-0100'
  },
  {
    email: 'manager@lagunabay.dev',
    password: 'manager123',
    name: 'Project Manager',
    roleId: 434, // Administrator role (has management permissions)
    phone_number: '+1-555-0101'
  },
  {
    email: 'sales@lagunabay.dev',
    password: 'sales123',
    name: 'Sales Representative',
    roleId: 435, // Contractor role (r-QpoZrh)
    phone_number: '+1-555-0102'
  },
  {
    email: 'accountant@lagunabay.dev',
    password: 'account123',
    name: 'Accountant',
    roleId: 435, // Contractor role (r-QpoZrh)
    phone_number: '+1-555-0103'
  },
  {
    email: 'viewer@lagunabay.dev',
    password: 'viewer123',
    name: 'Viewer',
    roleId: 433, // General User role
    phone_number: '+1-555-0104'
  }];


  return {
    message: 'Demo user credentials ready for Laguna Bay Development',
    users: testUsers.map((user) => ({
      email: user.email,
      password: user.password,
      name: user.name,
      roleId: user.roleId,
      phone_number: user.phone_number
    }))
  };
}