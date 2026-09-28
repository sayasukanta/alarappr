const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function main() {
  const schemaSql = fs.readFileSync(path.join(__dirname, '../prisma/hostinger_schema.sql'), 'utf-8');
  let seedSql = fs.readFileSync(path.join(__dirname, 'seed_data.sql'), 'utf-8');

  const adminHash = await bcrypt.hash('admin123', 10);
  const instructorHash = await bcrypt.hash('instructor123', 10);
  const pesertaHash = await bcrypt.hash('peserta123', 10);
  const sponsorHash = await bcrypt.hash('sponsor123', 10);

  seedSql = seedSql
    .replace('__ADMIN_HASH__', adminHash)
    .replace('__INSTRUCTOR_HASH__', instructorHash)
    .replace('__PESERTA_HASH__', pesertaHash)
    .replace('__SPONSOR_HASH__', sponsorHash);

  const fullSql = schemaSql + '\n\n' + seedSql;
  fs.writeFileSync(path.join(__dirname, '../prisma/alara_hostinger_init.sql'), fullSql);
  console.log('✅ Generated prisma/alara_hostinger_init.sql successfully! Total size:', fullSql.length, 'bytes');

  // Also copy to root alara.sql
  fs.writeFileSync(path.join(__dirname, '../alara.sql'), fullSql);
  console.log('✅ Updated root alara.sql successfully!');
}

main().catch(console.error);
