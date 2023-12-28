
// Use the Singleton pattern to enable lazy construction of the pipeline.
export class RecorderSingleton {
    static instance: MediaRecorder | null = null;
    
    static getInstance(mediaStream: MediaStream) {
        console.log('instance ??')
        if (this.instance === null) {
            this.instance = new MediaRecorder(mediaStream); 
        }
        console.log('instance ??')
        console.log(this.instance);
        return this.instance;
    }
}