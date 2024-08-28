const mysql = require('mysql2/promise');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to execute a query using the connection pool
async function executeQuery() {
  let connection;

  try {
    
    // Get a connection from the pool
    connection = await pool.getConnection();

    // Use the connection to execute a query
    const [rows, fields] = await connection.execute('SELECT * FROM users');

    // Process the query results
    console.log('Query Results:', rows);

  } catch (error) {
    console.error('Error executing query:', error);

  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}

// Execute the query
executeQuery()
  .then(() => {
    console.log('Query executed successfully.');
  })
  .catch((error) => {
    console.error('Error:', error);
  })
  .finally(() => {
     // Close the connection pool when done
    pool.end();
  });
