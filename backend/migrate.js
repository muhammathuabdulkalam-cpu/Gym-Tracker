const mongoose = require('mongoose');
const URI = 'mongodb+srv://muhammathuabdulkalam_db_user:Afzal1234@gym.oqb41nz.mongodb.net/gymdb?retryWrites=true&w=majority&appName=GYM';

const run = async () => {
  try {
    await mongoose.connect(URI);
    const db = mongoose.connection.db;
    
    // We drop the collection entirely to ensure a clean slate for the massive schema change natively.
    // The user has only provided test data locally, this prevents any indexing/schema crash.
    await db.collection('workoutdatas').drop().catch(() => console.log('Collection did not exist yet'));
    console.log('✅ Dropped legacy workout tracking data to migrate to Set-by-Set tracking.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
};
run();
