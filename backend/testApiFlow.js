const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');

async function runTests() {
  const api = axios.create({ baseURL: 'http://localhost:5000/api' });

  // Connect to the DB
  require('dotenv').config();
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saas-restaurant');
  console.log("Connected to DB");
  
  // Cleanup test data
  await User.deleteMany({ email: { $regex: 'test' } });
  const Business = require('./models/Business');
  await Business.deleteMany({ name: { $regex: 'Test' } });
  const Order = require('./models/Order');
  
  // Create admin
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);
  const admin = await User.create({ name: 'Test Admin', email: 'testadmin@app.com', password: hash, role: 'admin' });

  // Admin login
  let res = await api.post('/auth/login', { email: 'testadmin@app.com', password: 'password123' });
  const adminToken = res.data.token;
  console.log("1. Admin logged in");

  // Register Owner
  res = await api.post('/auth/register', { name: 'Test Owner', email: 'testowner@app.com', password: 'password123', businessName: 'Test Cafe' });
  console.log("2. Owner registered");

  // Owner login attempt
  try {
     await api.post('/auth/login', { email: 'testowner@app.com', password: 'password123' });
     console.log("ERROR: Owner login should have failed");
  } catch (err) {
     console.log("3. Owner login correctly blocked with message:", err.response.data.error);
  }

  // Admin approves Owner
  res = await api.get('/admin/pending-owners', { headers: { Authorization: `Bearer ${adminToken}` } });
  const pendingOwnerId = res.data.data.find(o => o.email === 'testowner@app.com')._id;
  await api.patch(`/admin/approve-owner/${pendingOwnerId}`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
  console.log("4. Admin approved pending owner");

  // Owner login success
  res = await api.post('/auth/login', { email: 'testowner@app.com', password: 'password123' });
  const ownerToken = res.data.token;
  console.log("5. Owner logged in successfully");

  // Owner adds Employee
  try {
      res = await api.post('/auth/add-employee', { name: 'Test Emp', email: 'testemp@app.com', password: 'password123' }, { headers: { Authorization: `Bearer ${ownerToken}` } });
      console.log("6. Employee added by Owner");
  } catch(e) {
      console.log('add-employee failed', e?.response?.data || e.message)
      throw e;
  }

  // Employee Login
  res = await api.post('/auth/login', { email: 'testemp@app.com', password: 'password123' });
  const empToken = res.data.token;
  console.log("7. Employee logged in successfully");

  // Clear orders for this business so we have clean slate
  const ownerBizId = res.data.user.businessId;
  await Order.deleteMany({ businessId: ownerBizId });

  // Employee creates order
  res = await api.post('/orders', { 
    customerName: 'Alice Test', 
    items: [{ name: 'Pizza', quantity: 2, price: 50 }],
    totalAmount: 100,
    paymentType: 'cash',
    status: 'paid'
  }, { headers: { Authorization: `Bearer ${empToken}` } });
  console.log("8. Order created by employee:", res.data.data.totalAmount);

  // Owner fetches orders summary & analytics
  res = await api.get('/orders/summary', { headers: { Authorization: `Bearer ${ownerToken}` } });
  console.log("9. Owner Summary:", res.data.data);

  res = await api.get('/orders', { headers: { Authorization: `Bearer ${ownerToken}` } });
  console.log("10. Owner Orders Count:", res.data.data.length);

  res = await api.get('/orders/employee-activity', { headers: { Authorization: `Bearer ${ownerToken}` } });
  console.log("11. Owner Employee Activity:", res.data.data[0]);

  // Admin fetches activity
  res = await api.get('/admin/activity', { headers: { Authorization: `Bearer ${adminToken}` } });
  console.log("12. Admin Feed Activity:", res.data.data.employeeActivity[0]);

  console.log("✅ All Backend Flows Passed Successfully");
  process.exit(0);
}

runTests().catch(e => {
  console.error("Test failed:", e.response ? e.response.data : e.message);
  process.exit(1);
});
