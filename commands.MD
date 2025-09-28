create bucket

aws s3api create-bucket \
 --profile akave-o3 \
 --bucket my-akave-bucketos= \
 --endpoint-url https://o3-rc2.akave.xyz

List bucket

aws s3api list-buckets \
 --profile akave-o3 \
 --endpoint-url https://o3-rc2.akave.xyz

Delete bucket

aws s3api delete-bucket \
--profile akave-o3 \
--bucket my-akave-bucketoss \
--endpoint-url https://o3-rc2.akave.xyz

Upload video
aws s3 cp ./Temperature.mp4 s3://my-akave-bucketoss/Temperature.mp4 \
--profile akave-o3 \
--endpoint-url https://o3-rc2.akave.xyz

aws s3api list-objects \
 --profile akave-o3 \
 --bucket my-akave-bucketoss \
 --endpoint-url https://o3-rc2.akave.xyz
