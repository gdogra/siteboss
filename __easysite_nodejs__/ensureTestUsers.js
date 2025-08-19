// This function ensures test users exist in the system with proper roles
async function ensureTestUsers() {
  const testUsers = [
  {
    email: 'admin@lagunabay.dev',
    password: 'admin123',
    name: 'Administrator',
    roleCode: 'Administrator'
  },
  {
    email: 'manager@lagunabay.dev',
    password: 'manager123',
    name: 'Project Manager',
    roleCode: 'Administrator'
  },
  {
    email: 'sales@lagunabay.dev',
    password: 'sales123',
    name: 'Sales Representative',
    roleCode: 'r-QpoZrh'
  },
  {
    email: 'accountant@lagunabay.dev',
    password: 'account123',
    name: 'Accountant',
    roleCode: 'r-QpoZrh'
  },
  {
    email: 'viewer@lagunabay.dev',
    password: 'viewer123',
    name: 'Viewer',
    roleCode: 'GeneralUser'
  }];


  const results = [];

  for (const user of testUsers) {
    try {
      // Try to register each user (this will fail if they already exist)
      const response = await fetch('${window.location.origin}/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          name: user.name
        })
      });

      if (response.ok) {
        results.push({
          email: user.email,
          status: 'created',
          roleCode: user.roleCode
        });
      } else {
        results.push({
          email: user.email,
          status: 'already_exists',
          roleCode: user.roleCode
        });
      }
    } catch (error) {
      results.push({
        email: user.email,
        status: 'error',
        error: error.message,
        roleCode: user.roleCode
      });
    }
  }

  return {
    message: 'Demo users processed',
    results: results,
    instructions: 'These are the demo login credentials for testing different roles in the system'
  };
}