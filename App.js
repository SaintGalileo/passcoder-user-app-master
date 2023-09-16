import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View,SafeAreaView } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useFonts } from 'expo-font';
import { Appwrapper } from './Navigation';
import Toast from 'react-native-toast-message';
import { BaseUrl } from './utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColor } from './utils/Color';

export default function App() {
	const [userToken, setUsertoken] = useState('');
	const [userIdToken, setUserIdToken] = useState('');

	const [startApp, setStartApp] = useState(false);
	const [onboarded, setOnboarded] = useState(false);

	//load app font
	const [fontsLoaded] = useFonts({
		'lexendBold': require('./assets/Fonts/Lexend-Bold.ttf'),
		'lexendMedium': require('./assets/Fonts/Lexend-Medium.ttf'),
		'lexendLight': require('./assets/Fonts/Lexend-Light.ttf'),
	});

	async function getApplaunched() {
		await AsyncStorage.getItem('appLaunched').then((res) => {
			setOnboarded(res === "true" ? true : false);
			setTimeout(async () => {
				setStartApp(true)
			}, 2000);
		})
	}

	//get user id toke
	async function GetUserIdToken() {
		const idToken = await auth().currentUser.getIdTokenResult()
		setUserIdToken(idToken.token)
	}

	//details
	const [details, setDetails] = useState();
	const [image, setImage] = useState();

	const [isLoggedIn, setIsLoggedIn] = useState(false);

	//request user permission
	async function requestUserPermission() {
		const authStatus = await messaging().requestPermission();
		const enabled =
			authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
			authStatus === messaging.AuthorizationStatus.PROVISIONAL;

		if (enabled) {
			// console.log('Authorization status:', authStatus);
		} else {
			// console.error('Failed to get user token!')
		}
	}

	//fetch current user profile
	async function getCurrentUser() {
		const userToken = await AsyncStorage.getItem('userToken')
		fetch(`${BaseUrl}/user/profile`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			}
		}).then(async (res) => {
			const response = await res.json();
			if (res.status === 200) setIsLoggedIn(true);
		}).catch((err) => console.log(err))
	}

	//useEffect to always ask for the permission
	useEffect(() => {
		getApplaunched()
		getCurrentUser()
		if (requestUserPermission()) {
			//return token for the user device
			messaging().getToken().then((token) => {
				// console.log(token);
				setUsertoken(token)
			})
		}

		// Check whether an initial notification is available
		messaging()
			.getInitialNotification()
			.then(async (remoteMessage) => {
				if (remoteMessage) {
					// console.log(
					//   'Notification caused app to open from quit state:',
					//   remoteMessage.notification,
					// );
				}
			});

		// Assume a message-notification contains a "type" property in the data payload of the screen to open

		messaging().onNotificationOpenedApp(async (remoteMessage) => {
			// console.log(
			//   'Notification caused app to open from background state:',
			//   remoteMessage.notification,
			// );
		});

		// Register background handler
		messaging().setBackgroundMessageHandler(async (remoteMessage) => {
			// console.log('Message handled in the background!', remoteMessage);
		});

		//returning an alert
		const unsubscribe = messaging().onMessage(async remoteMessage => {
			// console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
			// setDetails(remoteMessage.notification.body)
			Toast.show({
				type: 'success',
				text1: "Notification",
				text2: remoteMessage.notification.body || "You have a new notification!"
			})
		});

		// return unsubscribe;
	}, [])

	//return null if font is not loaded
	if (!fontsLoaded) {
		return null;
	}

	return (
		<>
			{startApp ? (
				<Appwrapper isLoggedIn={isLoggedIn} onboarded={onboarded} />
			) : (
				<Modal visible={true} >
					<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
						<ActivityIndicator color={AppColor.Blue} size={50} />
						<Text style={{ fontFamily: "lexendBold" }}>Loading ...</Text>
					</View>
				</Modal>
			)}
			<Toast />
			<StatusBar style="auto" />
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
