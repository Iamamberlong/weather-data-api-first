// insertData.js

import { db } from './database.js'; // Adjust the path as per your project structure


async function insertSampleData() {
    await insertData('users', [
      { email: 'jasper@gmail.com', password: "abc123", role: 'Teacher', createdAt: '2021-05-07T03:14:09.000+00:00', authenticationKey: 'abc123', lastLogin: '2024-07-07T03:14:09.000+00:00' },
      { name: 'Jane Smith', age: 25, city: 'San Francisco' },
      { name: 'Mike Johnson', age: 35, city: 'Chicago' }
    ]);
  
    await insertData('user_data', [
      { username: 'johndoe', email: 'john@example.com' },
      { username: 'janesmith', email: 'jane@example.com' },
      { username: 'mikejohnson', email: 'mike@example.com' }
    ]);
  
    await insertData('transaction_data', [
      { userId: 'johndoe', amount: 100, date: new Date() },
      { userId: 'janesmith', amount: 200, date: new Date() },
      { userId: 'mikejohnson', amount: 300, date: new Date() }
    ]);
  }
  
  // Call the function to insert sample data
  insertSampleData().catch(console.error);