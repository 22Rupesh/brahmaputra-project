
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { UserProfile, FileItem } from '../../types';
import { supabase } from '../../lib/supabaseClient';


interface FilesPageProps {
  viewedUser: UserProfile;
}

const FileIcon = ({ type }: { type: string }) => {
  let finalType = 'file';
  if (type.startsWith('image/')) finalType = 'img';
  if (type === 'application/pdf') finalType = 'pdf';
  if (type.includes('word')) finalType = 'doc';
  if (type.includes('excel') || type.includes('spreadsheet')) finalType = 'xls';
  if (type.includes('presentation') || type.includes('powerpoint')) finalType = 'ppt';

  const iconMap: { [key: string]: React.ReactElement } = {
    folder: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
    pdf: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg>,
    doc: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    xls: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5l4 4v10a2 2 0 01-2 2z" /></svg>,
    ppt: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>,
    img: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    file: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  };
  return iconMap[finalType] || iconMap['file'];
};

const FilesPage: React.FC<FilesPageProps> = ({ viewedUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from('user_files').list(String(viewedUser.id), {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      console.error("Error fetching files:", error.message);
      // Create an empty folder for the user if it doesn't exist
      if (error.message.includes('not found')) {
        const { error: uploadError } = await supabase.storage.from('user_files').upload(`${viewedUser.id}/.placeholder`, new Blob(['']));
        if(uploadError) console.error("Could not create user folder:", uploadError.message);
      }
    } else {
      setFiles(data.filter(f => f.name !== '.placeholder'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [viewedUser.id]);


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      const { error } = await supabase.storage
        .from('user_files')
        .upload(`${viewedUser.id}/${file.name}`, file, { upsert: true });

      setUploading(false);
      if (error) {
        alert(`Error uploading file: ${error.message}`);
      } else {
        alert('File uploaded successfully!');
        await fetchFiles();
      }
    }
  };

  const handleFileItemClick = async (fileName: string) => {
      const { data, error } = await supabase.storage.from('user_files').download(`${viewedUser.id}/${fileName}`);
      if (error) {
          alert(`Error downloading file: ${error.message}`);
      } else if (data) {
          const url = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      }
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-dark">File Repository</h2>
        <button onClick={handleUploadClick} disabled={uploading} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm disabled:bg-gray-400">
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
      {loading ? <p>Loading files...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file) => (
            <div 
              key={file.id} 
              onClick={() => handleFileItemClick(file.name)}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center cursor-pointer hover:shadow-lg transition-shadow"
            >
              <FileIcon type={file.metadata?.mimetype || ''} />
              <p className="font-semibold text-brand-dark mt-2 text-sm truncate w-full">{file.name}</p>
              <p className="text-xs text-brand-light mt-1">
                {file.metadata?.size ? formatBytes(file.metadata.size) : 'N/A'}
              </p>
              {file.created_at && <p className="text-xs text-brand-light">Added: {new Date(file.created_at).toLocaleDateString()}</p>}
            </div>
          ))}
          {files.length === 0 && <p className="col-span-full text-center text-gray-500">No files found. Upload a file to get started.</p>}
        </div>
      )}
    </div>
  );
};

export default FilesPage;
