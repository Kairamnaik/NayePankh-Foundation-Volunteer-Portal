const BASE_URL = 'http://localhost:5001/api';

const fetchJSON = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let errBody = '';
    try {
      errBody = await response.json();
    } catch {
      errBody = await response.text();
    }
    const err = new Error(`Request failed: ${response.status}`);
    err.status = response.status;
    err.data = errBody;
    throw err;
  }

  if (options.raw) return response;
  return response.json();
};

const runTests = async () => {
  console.log('=== PROGRAMMATIC BACKEND API AUDIT (USING NATIVE FETCH) ===');

  try {
    // 1. Authenticate Volunteer
    console.log('\nTesting Volunteer Login...');
    const volLoginRes = await fetchJSON(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'volunteer@gmail.com',
        password: 'volunteerpassword123',
      },
    });

    const volToken = volLoginRes.token;
    const volunteerId = volLoginRes.volunteerId;
    console.log('✅ Volunteer Login Success! Token acquired.');
    console.log(`Volunteer ID: ${volunteerId}, Badge: Silver (seeded)`);

    // 2. Fetch Volunteer Profile
    console.log('\nFetching Volunteer Profile details...');
    const profileRes = await fetchJSON(`${BASE_URL}/volunteers/profile`, {
      headers: { Authorization: `Bearer ${volToken}` },
    });
    console.log(`✅ Profile retrieved successfully! Name: ${profileRes.fullName}`);

    // 3. Authenticate Admin
    console.log('\nTesting Admin Login...');
    const adminLoginRes = await fetchJSON(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'admin@nayepankh.org',
        password: 'adminpassword123',
      },
    });
    const adminToken = adminLoginRes.token;
    console.log('✅ Admin Login Success! Token acquired.');

    // 4. Fetch Admin Statistics
    console.log('\nFetching Admin Dashboard Analytics...');
    const statsRes = await fetchJSON(`${BASE_URL}/volunteers/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ Admin Stats retrieved:');
    console.log(`- Total Volunteers: ${statsRes.totalVolunteers}`);
    console.log(`- Total Hours Logged: ${statsRes.totalHours} hrs`);
    console.log(`- Growth months registered counts size: ${statsRes.growthChart.length}`);

    // 5. Fetch Events List
    console.log('\nFetching Campaign Events list...');
    const eventsRes = await fetchJSON(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${volToken}` },
    });
    console.log(`✅ Events retrieved. Count: ${eventsRes.length}`);
    const upcomingEvent = eventsRes.find(e => e.status === 'upcoming');
    console.log(`Selected Upcoming Event: "${upcomingEvent.title}" at ${upcomingEvent.location}`);

    // 6. Register Volunteer for Upcoming Event
    console.log(`\nRegistering Volunteer ${profileRes.fullName} for event: "${upcomingEvent.title}"...`);
    const regRes = await fetchJSON(`${BASE_URL}/events/${upcomingEvent._id}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${volToken}` },
    });
    console.log(`✅ Registration response: ${regRes.message}`);

    // 7. Admin Checks In Volunteer
    console.log('\nAdmin scanning/checking in volunteer...');
    const checkInRes = await fetchJSON(`${BASE_URL}/attendance/check-in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        volunteerId,
        eventId: upcomingEvent._id,
      },
    });
    console.log(`✅ Check-In Success! Attendance ID: ${checkInRes.attendance._id}`);

    // 8. Admin Checks Out Volunteer
    console.log('\nAdmin checking out volunteer (crediting hours)...');
    const checkOutRes = await fetchJSON(`${BASE_URL}/attendance/check-out`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        volunteerId,
        eventId: upcomingEvent._id,
      },
    });
    console.log('✅ Check-Out Success!');
    console.log(`- Hours Credited: ${checkOutRes.hoursWorked} hrs`);
    console.log(`- Volunteer New Hours total: ${checkOutRes.totalHours} hrs`);
    console.log(`- Volunteer New Badge level: ${checkOutRes.badge}`);
    console.log(`- Generated Certificate Code: ${checkOutRes.certificateCode}`);

    // 9. Download Certificate PDF
    console.log('\nDownloading Certificate PDF...');
    const certListRes = await fetchJSON(`${BASE_URL}/certificates/my-certificates`, {
      headers: { Authorization: `Bearer ${volToken}` },
    });
    console.log(`✅ Volunteer Certificates List fetched. Count: ${certListRes.length}`);
    const certToDownload = certListRes[0];

    const downloadRes = await fetchJSON(`${BASE_URL}/certificates/${certToDownload._id}/download`, {
      headers: { Authorization: `Bearer ${volToken}` },
      raw: true,
    });
    const pdfBlob = await downloadRes.blob();
    console.log(`✅ Certificate download verified! Blob size: ${pdfBlob.size} bytes.`);

    // 10. Admin Export Reports CSV
    console.log('\nAdmin exporting Volunteer Roster report (CSV)...');
    const reportRes = await fetchJSON(`${BASE_URL}/reports/volunteers/csv`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      raw: true,
    });
    const csvText = await reportRes.text();
    console.log(`✅ Volunteer Report CSV export verified! Row count: ${csvText.split('\n').length - 1}`);

    console.log('\n🎉 ALL BACKEND API TEST PATHWAYS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ API TEST FAILED!');
    if (error.data) {
      console.error(`Status: ${error.status}`);
      console.error('Response Message:', error.data);
    } else {
      console.error(error.stack || error.message);
    }
    process.exit(1);
  }
};

runTests();
