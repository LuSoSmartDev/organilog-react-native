package com.organilog;

import android.app.Application;

import com.bugsnag.BugsnagReactNative;

import com.facebook.react.ReactApplication;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import com.transistorsoft.rnbackgroundgeolocation.RNBackgroundGeolocation;
import com.oblador.vectoricons.VectorIconsPackage;
import com.wix.reactnativenotifications.RNNotificationsPackage;
import com.rssignaturecapture.RSSignatureCapturePackage;
import cl.json.RNSharePackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import io.realm.react.RealmReactPackage;
import com.i18n.reactnativei18n.ReactNativeI18n;
//import com.microsoft.codepush.react.CodePush;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.imagepicker.ImagePickerPackage;
//import io.fabric.sdk.android.Fabric;
//import com.crashlytics.android.Crashlytics;
import com.reactnativecomponent.barcode.RCTCapturePackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private  ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

//    @Override
//    protected String getJSBundleFile() {
//        return supper.getJSBundleFile();
////      return CodePush.getJSBundleFile();
//    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new RNBackgroundFetchPackage(),
            new RNBackgroundGeolocation(),
            new VectorIconsPackage(),
            BugsnagReactNative.getPackage(),
            new RSSignatureCapturePackage(),
            new RNSharePackage(),
            new RNFetchBlobPackage(),
            new RealmReactPackage(),
            new ReactNativeI18n(),
            new ImagePickerPackage(),
            new RNNotificationsPackage(MainApplication.this),
//            new CodePush(null, getApplicationContext(), BuildConfig.DEBUG),
            new RCTCapturePackage()
//            new FIRAnalyticsPackage(),
//            new RNFirebaseCrashReportPackage()

      );
    }
  };
  public void setReactNativeHost(ReactNativeHost reactNativeHost) {
    mReactNativeHost = reactNativeHost;
  }

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
      BugsnagReactNative.start(this);
      SoLoader.init(this, /* native exopackage */ false);

//    Fabric.with(this, new Crashlytics());
  }
}
