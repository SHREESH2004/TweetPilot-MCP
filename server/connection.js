import mysql from 'mysql2/promise';

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'shreesh2004',
  database: 'ass1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fetch data from a table
export async function fetchTableData(tableName) {
  if (!tableName || !/^[a-zA-Z0-9_]+$/.test(tableName)) {
    return {
      content: [
        { type: 'text', text: '❌ Invalid or missing table name.' }
      ]
    };
  }

  try {
    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);

    // Format the rows as a single string, with each row separated by a newline
    const formattedRows = rows.map(row => {
      // Join each key-value pair in the row with a colon and space (key: value)
      return Object.entries(row)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', '); // Join the key-value pairs with commas
    }).join('\n'); // Join each row with a newline character

    return {
      content: [
        {
          type: 'text', // Ensure only "text" type is used
          text: `✅ Fetched ${rows.length} row(s) from table "${tableName}"`,
        },
        {
          type: 'text', // Use 'text' to display formatted rows
          text: formattedRows // Pass the formatted rows
        }
      ]
    };
  } catch (err) {
    console.error(`❌ Error fetching data from "${tableName}":`, err.message);
    return {
      content: [
        {
          type: 'text', // Use 'text' to show error message
          text: `❌ Failed to fetch data from "${tableName}": ${err.message}`
        }
      ]
    };
  }
}

// Function to add a new user
export async function addUser(name, email) {
  if (!name || !email) {
    return {
      content: [
        { type: 'text', text: '❌ Name and email are required to add a new user.' }
      ]
    };
  }

  try {
    // Insert a new user into the users table
    const [result] = await pool.query(
      'INSERT INTO users (name, email) VALUES (?, ?)', 
      [name, email]
    );

    return {
      content: [
        { 
          type: 'text',
          text: `✅ Successfully added new user: ${name}, ${email}.`
        }
      ]
    };
  } catch (err) {
    console.error('❌ Error adding new user:', err.message);
    return {
      content: [
        { 
          type: 'text', 
          text: `❌ Failed to add user: ${err.message}` 
        }
      ]
    };
  }
}

// Wrapper function for tool to fetch table data
export async function myFetchTool({ tableName }) {
  return fetchTableData(tableName);
}

// Wrapper function for tool to add a user
export async function myAddUserTool({ name, email }) {
  return addUser(name, email);
}


