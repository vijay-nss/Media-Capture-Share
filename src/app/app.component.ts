import { Component } from '@angular/core';
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationEvents,
  BackgroundGeolocationResponse,
} from '@ionic-native/background-geolocation/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';


import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions, CaptureAudioOptions } from '@ionic-native/media-capture/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  constructor(private backgroundGeolocation: BackgroundGeolocation,private socialSharing: SocialSharing,
    private camera: Camera,
    private mediaCapture: MediaCapture,
    private media: Media,private firebase:FirebaseX) {}

  lat: any = 0;
  lon: any = 0;
  status: any = 'not called';

  capturedImage: string='';
  audioFile: MediaObject|any;
  videoFile: MediaFile|any;
  isRecording: boolean = false;
  deviceToken: any = '';

  ngOnInit() {
  }

  startTracking() {
    this.status = 'Initiated';

    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 25,
      distanceFilter: 10,
      debug: false,
      stopOnTerminate: false,
      startOnBoot: true,
      notificationTitle: 'Background Tracking',
      notificationText: 'Tracking location...',
      notificationIconColor: 'black',
      notificationIconLarge: 'drawable/ic_location',
      locationProvider: 1,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
    };

    this.backgroundGeolocation
      .configure(config)
      .then(() => {
        this.status = 'Configured';

        this.backgroundGeolocation
          .on(BackgroundGeolocationEvents.location)
          .subscribe((location: BackgroundGeolocationResponse) => {
            this.lat = location.latitude;
            this.lon = location.longitude;

            console.log(`Latitude: ${this.lat}, Longitude: ${this.lon}`);
            this.status = 'Tracking';

            // Stop and restart geolocation to update notification text
            this.backgroundGeolocation.stop();
            config.notificationText = `Lat: ${this.lat}, Lon: ${this.lon}`;
            this.backgroundGeolocation.configure(config);
            this.backgroundGeolocation.start();
          });

        this.backgroundGeolocation.start();
      })
      .catch((error) => {
        this.status = 'Configuration Error';
        console.error('Error configuring BackgroundGeolocation:', error);
      });
  }

  shareText(data:any) {
    this.socialSharing.share(data, 'Share Data', '', '')
      .then(() => {
        console.log('Sharing successful!');
      })
      .catch((error) => {
        console.error('Error sharing', error);
      });
  }

  captureImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 3840,
      targetHeight: 2160,
      correctOrientation: true, 
    };
  
    this.camera.getPicture(options).then((imageData) => {
      this.capturedImage = 'data:image/jpeg;base64,' + imageData;
      console.log('Captured Image:', this.capturedImage);      
    }).catch((error) => {
      console.error("Error capturing image: ", error);
    });
  }

  recordVideo() {
    const options: CaptureVideoOptions = {
      limit: 1,  
      duration: 30  
    };

    this.mediaCapture.captureVideo(options).then(
      (mediaFiles: MediaFile[]|any) => {
        this.videoFile = mediaFiles[0];
        console.log("Video captured: ", this.videoFile);
      },
      (error: CaptureError) => {
        console.error("Video capture error: ", error);
      }
    );
  }

  startAudioRecording() {
    const fileName = 'my_audio.mp3'; 
    this.audioFile = this.media.create(fileName);
    this.audioFile.startRecord();
    this.isRecording = true;
  }

  stopAudioRecording() {
    if (this.isRecording && this.audioFile) {
      this.audioFile.stopRecord();
      this.isRecording = false;
      console.log('Audio recording stopped');
    }
  }

  playAudio() {
    if (this.audioFile) {
      this.audioFile.play();
    }
  }

  pushNotification() {
    this.firebase.getToken().then(token => {
      console.log('Firebase token:', token);
      this.deviceToken = token;
    }).catch(error => {
      console.log('Error getting token', error);
    });
  }

}
