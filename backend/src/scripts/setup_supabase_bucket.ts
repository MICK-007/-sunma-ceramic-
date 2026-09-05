import { getStorageClient, CMS_BUCKET_NAME, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_MAP } from '../utils/storage';

async function checkAndCreateBucket() {
  const supabase = getStorageClient();
  console.log('Listing buckets from Supabase Storage...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('List buckets error:', listError);
  } else {
    console.log('Existing buckets:', buckets.map(b => b.name));
  }

  console.log(`Attempting to create bucket '${CMS_BUCKET_NAME}' with public=true...`);
  const { data: createData, error: createError } = await supabase.storage.createBucket(CMS_BUCKET_NAME, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE_BYTES,
    allowedMimeTypes: Object.keys(ALLOWED_MIME_MAP),
  });

  if (createError) {
    console.error('Create bucket error:', createError);
  } else {
    console.log('Bucket created successfully:', createData);
  }
}

checkAndCreateBucket();
