"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../utils/storage");
async function checkAndCreateBucket() {
    const supabase = (0, storage_1.getStorageClient)();
    console.log('Listing buckets from Supabase Storage...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error('List buckets error:', listError);
    }
    else {
        console.log('Existing buckets:', buckets.map(b => b.name));
    }
    console.log(`Attempting to create bucket '${storage_1.CMS_BUCKET_NAME}' with public=true...`);
    const { data: createData, error: createError } = await supabase.storage.createBucket(storage_1.CMS_BUCKET_NAME, {
        public: true,
        fileSizeLimit: storage_1.MAX_FILE_SIZE_BYTES,
        allowedMimeTypes: Object.keys(storage_1.ALLOWED_MIME_MAP),
    });
    if (createError) {
        console.error('Create bucket error:', createError);
    }
    else {
        console.log('Bucket created successfully:', createData);
    }
}
checkAndCreateBucket();
