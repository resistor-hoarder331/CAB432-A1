const { S3Client, DeleteObjectCommand, PutBucketTaggingCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const bucketName = 'n11539861-A1';
const qutUsername = 'n11539861@qut.edu.au';
const purpose = 'Assessment1';

// Create S3 client using SDK v3
const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Initialize bucket with tags (call this once when app starts)
async function initializeBucket() {
  try {
    const command = new PutBucketTaggingCommand({
      Bucket: bucketName,
      Tagging: {
        TagSet: [
          {
            Key: 'qut-username',
            Value: qutUsername,
          },
          {
            Key: 'purpose',
            Value: purpose
          }
        ]
      }
    });

    const response = await s3Client.send(command);
    console.log('Bucket tagged successfully');
  } catch (err) {
    console.log('Bucket tagging error:', err.message);
  }
}

// Call this when your app starts
initializeBucket();

// File type validation
const fileFilter = (req, file, cb) => {
  // Video files
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for video upload'), false);
    }
  }
  // Audio files
  else if (file.fieldname === 'audio') {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for audio upload'), false);
    }
  }
  // Profile pictures
  else if (file.fieldname === 'profile_picture') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures'), false);
    }
  } else {
    cb(new Error('Invalid file field'), false);
  }
};

// Generate unique filename
const generateFileName = (originalName, fileType) => {
  const timestamp = Date.now();
  const uuid = uuidv4();
  const extension = path.extname(originalName);
  return `${fileType}/${timestamp}-${uuid}${extension}`;
};

// Multer S3 storage for videos
const videoUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    key: function (req, file, cb) {
      const fileName = generateFileName(file.originalname, 'videos');
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  }
});

// Multer S3 storage for audio
const audioUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    key: function (req, file, cb) {
      const fileName = generateFileName(file.originalname, 'audio');
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for audio
  }
});

// Multer S3 storage for profile pictures
const profilePictureUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    key: function (req, file, cb) {
      const fileName = generateFileName(file.originalname, 'profiles');
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  }
});

// Function to delete file from S3 (using SDK v3)
const deleteFile = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey
    });
    
    await s3Client.send(command);
    console.log(`File deleted: ${fileKey}`);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Function to generate signed URL for private files (using SDK v3)
const getSignedUrlForFile = async (fileKey, expires = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expires });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

// Function to get public URL
const getPublicUrl = (fileKey) => {
  return `https://${bucketName}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${fileKey}`;
};

module.exports = {
  videoUpload,
  audioUpload,
  profilePictureUpload,
  deleteFile,
  getSignedUrl: getSignedUrlForFile,
  getPublicUrl,
  s3Client,
  bucketName
};

//**
//  */