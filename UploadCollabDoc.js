import React, { useState } from 'react';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Document submitted!');
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <h4>Upload Document or SharePoint Link</h4>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input
        type="url"
        placeholder="SharePoint Link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default UploadForm;
