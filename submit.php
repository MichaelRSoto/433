<?php
/*******************************************************
 * Basic Petition Form Handling
 * - Receives "name", "email", "description" from the form
 * - Receives "attachment" (file upload) if provided
 * - Saves uploaded file to an "uploads" folder
 * - Emails the submission details to your chosen address
 *******************************************************/

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 1) Collect form fields
    //    Use the same "name" attributes from your HTML form
    $name        = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email       = isset($_POST['email']) ? trim($_POST['email']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';

    // 2) Handle the file if it was uploaded (attachment field)
    $uploadedFilePath = null; // will store the path if a file is actually uploaded

    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        // Create an "uploads" folder on your server (next to index.html and submit.php).
        // Make sure it is writable by PHP (permissions 755 or 775 typically).
        $uploadDir = __DIR__ . '/uploads/';

        // Use the original filename, but be mindful of potential collisions/duplicates.
        // You might want to generate a unique name to avoid overwriting.
        $fileName  = basename($_FILES['attachment']['name']);
        $targetFile = $uploadDir . $fileName;

        // Attempt to move the temp file into the uploads directory
        if (move_uploaded_file($_FILES['attachment']['tmp_name'], $targetFile)) {
            $uploadedFilePath = $targetFile;
        }
    }

    // 3) Prepare the email
    //    CHANGE THIS to the address you want to receive form notifications:
    $toEmail = "chmckinney433socialmedia@gmail.com";

    // A subject line for the email
    $subject = "New Petition from $name";

    // Build the body of the email. You can customize formatting, line breaks, etc.
    // Include the file path if an attachment was uploaded.
    $message  = "A new petition has been submitted.\n\n";
    $message .= "Name: $name\n";
    $message .= "Email: $email\n";
    $message .= "Description/Details: $description\n";

    if ($uploadedFilePath) {
        $message .= "Uploaded File: $uploadedFilePath\n";
    } else {
        $message .= "No file was uploaded or file upload failed.\n";
    }

    // Set headers. Here we set a "From" header so that the email appears from the user’s email address.
    // Note: Some hosts restrict 'From' to emails on your own domain. If that's the case,
    // use something like "From: no-reply@yourdomain.com" instead.
    $headers  = "From: $email\r\n";
    // Optionally, set "Reply-To: $email" so you can just hit Reply in your inbox.
    $headers .= "Reply-To: $email\r\n";

    // 4) Send the email using mail().
    //    NOTE: This only works if your hosting environment allows PHP's mail() function.
    //    If your host doesn't support it, you'll need a different method (e.g., PHPMailer, SMTP).
    $mailSuccess = mail($toEmail, $subject, $message, $headers);

    // 5) Output a success/failure message to the user
    //    If you want to redirect to a "Thank You" page, you could do it here instead.
    if ($mailSuccess) {
        echo "<h1>Thank you, $name!</h1>";
        echo "<p>Your petition has been submitted successfully. We will contact you soon.</p>";
    } else {
        echo "<h1>Oops!</h1>";
        echo "<p>There was a problem sending your petition. Please try again later.</p>";
    }

} else {
    // If someone tries to access submit.php directly via GET or something, just show a basic message or redirect.
    echo "Invalid request.";
}
