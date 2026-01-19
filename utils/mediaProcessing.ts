/**
 * Converts a File object to a Base64 string (without data prefix).
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };
  
  /**
   * Reads text content from a file.
   */
  export const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };
  
  /**
   * Extracts keyframes from a video file using HTML5 Canvas.
   * This avoids heavy WASM dependencies like ffmpeg.wasm for simple frame extraction.
   * 
   * @param videoFile The video file to process
   * @param numFrames Number of frames to extract
   * @returns Array of Base64 strings (images)
   */
  export const extractVideoFrames = async (videoFile: File, numFrames: number = 3): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames: string[] = [];
      
      // Create object URL for the video
      const url = URL.createObjectURL(videoFile);
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
  
      // Wait for metadata to load to know duration and dimensions
      video.onloadedmetadata = async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const duration = video.duration;
        const interval = duration / (numFrames + 1); // Distribute frames
        
        try {
          for (let i = 1; i <= numFrames; i++) {
            const time = interval * i;
            await seekToTime(video, time);
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Get JPEG base64 (quality 0.7 for optimization)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
                frames.push(dataUrl.split(',')[1]); // Remove prefix
            }
          }
          URL.revokeObjectURL(url);
          resolve(frames);
        } catch (err) {
            URL.revokeObjectURL(url);
            reject(err);
        }
      };
  
      video.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error("Error loading video"));
      };
    });
  };
  
  // Helper to seek video to specific time and wait for seeked event
  const seekToTime = (video: HTMLVideoElement, time: number): Promise<void> => {
    return new Promise((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
      video.currentTime = time;
    });
  };