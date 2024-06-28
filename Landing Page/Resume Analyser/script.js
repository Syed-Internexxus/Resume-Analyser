document.getElementById('scan-button').addEventListener('click', function() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file first.");
        return;
    }

    // Step 1: Upload the file to S3 and get the URL
    const s3BucketName = 'internexxus-resume';
    const s3Region = 'us-west-1';  // S3 region short code
    const s3UploadUrl = `https://${s3BucketName}.s3.${s3Region}.amazonaws.com/${file.name}`;

    fetch(s3UploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type
        },
        body: file
    })
    .then(response => {
        if (response.ok) {
            return s3UploadUrl;
        } else {
            throw new Error('Failed to upload file to S3');
        }
    })
    .then(s3Url => {
        // Step 2: Send the S3 URL to the Lambda endpoint
        return fetch('https://ngo00si22c.execute-api.us-west-1.amazonaws.com/default/resume_analyser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: s3Url })
        }).then(response => response.json());
    })
    .then(data => {
        // Handle response from the Lambda function
        console.log('Success:', data);

        // Update the score breakdown
        const scores = JSON.parse(data.body);

        // Redirect to review page with the scores and resume URL
        const reviewPageUrl = `review.html?s3Url=${encodeURIComponent(s3UploadUrl)}&scores=${encodeURIComponent(JSON.stringify(scores))}`;
        window.location.href = reviewPageUrl;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
