import postgres from 'postgres';

async function test() {
  const regions = [
    "aws-0-ap-southeast-1",
    "aws-0-ap-northeast-1",
    "aws-0-ap-northeast-2",
    "aws-0-ap-south-1",
    "aws-0-us-east-1",
    "aws-0-us-west-1",
    "aws-0-us-west-2",
    "aws-0-eu-west-1",
    "aws-0-eu-west-2 font",
    "aws-0-eu-central-1",
    "aws-0-sa-east-1",
    "aws-0-ca-central-1"
  ];

  for (const reg of regions) {
    const uri = `postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@${reg}.pooler.supabase.com:6543/postgres`;
    console.log('Testing region:', reg);
    try {
      const sql = postgres(uri, { idle_timeout: 3, connect_timeout: 3 });
      const res = await sql`SELECT 1 as connected;`;
      console.log('✅ SUCCESS WITH REGION:', reg);
      console.log('Full URI:', uri);
      await sql.end();
      return;
    } catch (e: any) {
      if (!e.message.includes('ENOTFOUND')) {
        console.log(`Region ${reg} response:`, e.message);
      }
    }
  }
}

test();
