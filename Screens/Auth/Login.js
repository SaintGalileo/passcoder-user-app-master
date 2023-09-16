import { ActivityIndicator, Dimensions, Image, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppColor } from '../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import { BaseUrl } from '../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { return_all_letters_uppercase } from '../../utils/Validations';

export default function Login() {
    //nav props
    const nav = useNavigation();

    const [userRemind, setUserRemind] = useState(null);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
    const [isCredentialsAvailable, setIsCredentialsAvailable] = useState(false);
    const [isBiometricMethodAvailable, setIsBiometricMethodAvailable] = useState(false);
    
    const [biometricMethod, setBiometricMethod] = useState(null);

    const [emailCredentials, setEmailCredentials] = useState(null);
    const [pidCredentials, setPIDCredentials] = useState(null);

    const [Pid, setPid] = useState('');
    const [pidPin, setPidpin] = useState('');

    //sign in method 
    const [method, setMethod] = useState('Email');
    const [userToken, setUsertoken] = useState('');

    async function GetRemind() {
        const passToken = await AsyncStorage.getItem('userPID').then((res) => {
            setUserRemind(res)
            setPid(return_all_letters_uppercase(res))
        }).catch(() => {
            
        })
    };

    //get user token
    useEffect(() => {
        messaging().getToken().then((token) => {
            setUsertoken(token)
        })

        messaging().onNotificationOpenedApp(async (remoteMessage) => {
            if (remoteMessage.data.type === "Notification") {
                nav.navigate('Notifications');
            } else if (remoteMessage.data.type === "Request") {
                nav.navigate('Request');
            } else if (remoteMessage.data.type === "Payment Request") {
                nav.navigate('Wallet');
            } else if (remoteMessage.data.type === "Announcement") {
                nav.navigate('Updates');
            } else {
                nav.navigate('Home');
            }
        });

        GetRemind();

        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            setIsBiometricSupported(compatible);
            const available = await LocalAuthentication.isEnrolledAsync();
            setIsBiometricEnrolled(available);
            const level = await LocalAuthentication.getEnrolledLevelAsync();
            setIsBiometricMethodAvailable(level === 2 ? true : false);
            const method = await LocalAuthentication.supportedAuthenticationTypesAsync();
            setBiometricMethod(method.includes(2) ? "faceid" : "fingerprint");
            const userEmail = await AsyncStorage.getItem('userEmail');
            const userPid = await AsyncStorage.getItem('userPID');

            if (userEmail || userPid) setIsCredentialsAvailable(true);
            if (userEmail) setEmailCredentials(userEmail);
            if (userPid) setPIDCredentials(userPid);
        })();
    }, []);

    //loading state
    const [loading, setLoading] = useState(false);
    const [loadingBiometrics, setLoadingBiometrics] = useState(false);

    const [showEmailpassword, setShowEmailPass] = useState(true);

    //user login details states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //method data
    const methodData = [
        {
            title: 'Email',
            desc: "email"
        },
        {
            title: "PID",
            desc: "Pid"
        }
    ];

    //sign in user
    async function Signin() {
        if (!email) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Enter your email"
            })
        } else if (!password) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Enter your password"
            })
        } else {
            Keyboard.dismiss()
            setLoading(true);
            fetch(`${BaseUrl}/auth/user/signin/via/email`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    password: password
                })
            }).then(async (res) => {
                const response = await res.json();
                if (response.success) {
                    if (!response.data.token) {
                        Toast.show({
                            type: "success",
                            text1: "Notification",
                            text2: response.message
                        });
                        nav.navigate('Otp', { pid: null, email: email.toLowerCase() });
                        setLoading(false);
                    } else {
                        await AsyncStorage.setItem('userToken', response.data.token);
                        await AsyncStorage.setItem('userPID', response.data.pid);
                        await AsyncStorage.setItem('userUID', response.data.uid);
                        await AsyncStorage.setItem('userEmail', email.toLowerCase());
                        const passToken = await AsyncStorage.getItem('userToken')
                        fetch(`${BaseUrl}/user/profile/pushid`, {
                            method: "PUT",
                            headers: {
                                'passcoder-access-token': passToken,
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                push_id: userToken
                            })
                        }).then(async (res) => {
                            nav.replace("Passcoder");
                            setLoading(false);
                        }).catch((err) => {
                            setLoading(false);
                            Toast.show({
                                type: "error",
                                text1: "Error",
                                text2: "An error occured!"
                            });
                        })
                    }
                } else {
                    if (res.status === 409) {
                        auth().signInWithEmailAndPassword(email.toLowerCase(), password).then(async (res) => {
                            if (!res.user.emailVerified) {
                                Toast.show({
                                    type: "error",
                                    text1: "Error",
                                    text2: "Please kindly verify your email address!"
                                })
                                setLoading(false);
                            } else {
                                const idToken = await auth().currentUser.getIdTokenResult(true).then(async (res) => {
                                    if (res.token) await AsyncStorage.setItem('userToken', res.token); await AsyncStorage.setItem('userEmail', email.toLowerCase());
                                    fetch(`${BaseUrl}/user/profile/pushid`, {
                                        method: "PUT",
                                        headers: {
                                            'passcoder-access-token': res.token,
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json',

                                        },
                                        body: JSON.stringify({
                                            push_id: userToken
                                        })
                                    }).then(async (res) => {
                                        const response = await res.json();
                                        const passToken = await AsyncStorage.getItem('userToken')
                                        fetch(`${BaseUrl}/user/private`, {
                                            method: "PUT",
                                            headers: {
                                                'passcoder-access-token': passToken,
                                                'Accept': 'application/json',
                                                'Content-Type': 'application/json',

                                            },
                                            body: JSON.stringify({
                                                email: email.toLowerCase(),
                                                password: password
                                            })
                                        }).then(async (res) => {
                                            fetch(`${BaseUrl}/user/profile`, {
                                                method: "POST",
                                                headers: {
                                                    'passcoder-access-token': passToken,
                                                    'Accept': 'application/json',
                                                    'Content-Type': 'application/json',

                                                }
                                            }).then(async (res) => {
                                                const userUID = auth().currentUser.uid;

                                                if (response?.data.pid && response?.data.pid !== "******") { await AsyncStorage.setItem('userPID', response?.data.pid) }

                                                await AsyncStorage.setItem('userUID', userUID);

                                                const response = await res.json();
                                                if (response?.data.two_factor_authentication === true) {
                                                    fetch(`${BaseUrl}/user/otp/create`, {
                                                        method: "POST",
                                                        headers: {
                                                            'passcoder-access-token': passToken,
                                                            'Accept': 'application/json',
                                                            'Content-Type': 'application/json',

                                                        }
                                                    }).then(async (res) => {
                                                        const response = await res.json();
                                                        if (response.success === true) {
                                                            nav.navigate('Otp', { pid: null, email: email.toLowerCase() });
                                                            setLoading(false);
                                                        } else {
                                                            setLoading(false);
                                                            Toast.show({
                                                                type: "error",
                                                                text1: "Error",
                                                                text2: "Error sending OTP!"
                                                            })
                                                        }
                                                    })

                                                } else {
                                                    Toast.show({
                                                        type: "success",
                                                        text1: "Success",
                                                        text2: "Login successful!"
                                                    })
                                                    nav.replace("Passcoder");
                                                    setLoading(false);
                                                }
                                            }).catch((err) => {
                                                setLoading(false);
                                                Toast.show({
                                                    type: "error",
                                                    text1: "Error",
                                                    text2: "Error occurued - 101"
                                                })
                                            })
                                        }).catch((err) => {
                                            setLoading(false);
                                            Toast.show({
                                                type: "error",
                                                text1: "Error",
                                                text2: "Error occurued - 100"
                                            })
                                        })

                                    }).catch((err) => {
                                        setLoading(false);
                                        Toast.show({
                                            type: "error",
                                            text1: "Error",
                                            text2: "Error occurued - 102"
                                        })
                                    })
                                })
                            }
                        }).catch((err) => {
                            if (err.code === "auth/wrong-password") {
                                setLoading(false);
                                Toast.show({
                                    type: "error",
                                    text1: "Error",
                                    text2: "Password or email incorrect"
                                })
                            } else if (err.code === "auth/too-many-requests") {
                                setLoading(false);
                                Toast.show({
                                    type: "error",
                                    text1: "Error",
                                    text2: "Too many attempts, try in 1 min"
                                })
                            } else if (err.code === "auth/user-not-found") {
                                setLoading(false);
                                Toast.show({
                                    type: "error",
                                    text1: "Error",
                                    text2: "User not found"
                                })
                            } else {
                                setLoading(false);
                                Toast.show({
                                    type: "error",
                                    text1: "Error",
                                    text2: "Error occurued - 103"
                                })
                            }
                        })
                    } else {
                        setLoading(false);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: res.status !== 422 ? response.message : response.data[0].msg
                        });
                    }
                }
            }).catch((err) => {
                setLoading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "An error occured!!"
                });
            })
        }
    };

    async function LoginWithPID() {
        if (Pid.length !== 6) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid PID!"
            })
        } else if (pidPin.length !== 4) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Pin invalid!"
            })
        } else {
            setLoading(true);
            Keyboard.dismiss()
            fetch(`${BaseUrl}/auth/user/signin/via/pid`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    pid: Pid.toUpperCase(),
                    pin: pidPin
                })
            }).then(async (res) => {
                const response = await res.json();
                if (response.success) {
                    if (!response.data.token) {
                        Toast.show({
                            type: "success",
                            text1: "Notification",
                            text2: response.message
                        });
                        nav.navigate('Otp', { pid: Pid.toUpperCase(), email: null });
                        setLoading(false);
                    } else {
                        await AsyncStorage.setItem('userToken', response.data.token);
                        await AsyncStorage.setItem('userPID', Pid);
                        const passToken = await AsyncStorage.getItem('userToken')
                        fetch(`${BaseUrl}/user/profile/pushid`, {
                            method: "PUT",
                            headers: {
                                'passcoder-access-token': passToken,
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                push_id: userToken
                            })
                        }).then(async (res) => {
                            nav.replace("Passcoder");
                            setLoading(false);
                        }).catch((err) => {
                            setLoading(false);
                            Toast.show({
                                type: "error",
                                text1: "Error",
                                text2: "An error occured!"
                            });
                        })
                    }
                } else {
                    setLoading(false)
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: res.status !== 422 ? response.message : response.data[0].msg
                    });
                }
            }).catch((err) => {
                setLoading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "An error occured!!"
                });
            })
        }
    };

    async function handleBiometricAuth() {
        const biometricAuth = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Login with Biometrics',
            disableDeviceFallback: true,
            cancelLabel: "Cancel"
        });

        if (!biometricAuth.success && biometricAuth.error === "lockout") {
            Toast.show({
                type: "error",
                text1: "Too many attempts",
                text2: "Login with credentials instead"
            })
        } else if (!biometricAuth.success) {
            if (biometricAuth.error !== "user_cancel") {
                Toast.show({
                    type: "error",
                    text1: "Biometrics Error",
                    text2: biometricAuth.warning ? biometricAuth.warning : "Error authenticating with biometrics"
                })
            }
        } else {
            setLoadingBiometrics(true);
            if (pidCredentials) {
                fetch(`${BaseUrl}/auth/user/signin/via/pid/and/biometrics`, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify({
                        pid: pidCredentials
                    })
                }).then(async (res) => {
                    const response = await res.json();
                    if (response.success) {
                        if (!response.data.token) {
                            Toast.show({
                                type: "success",
                                text1: "Notification",
                                text2: response.message
                            });
                            nav.navigate('Otp', { pid: pidCredentials, email: null });
                            setLoadingBiometrics(false);
                        } else {
                            await AsyncStorage.setItem('userToken', response.data.token);
                            await AsyncStorage.setItem('userPID', pidCredentials);
                            const passToken = await AsyncStorage.getItem('userToken')
                            fetch(`${BaseUrl}/user/profile/pushid`, {
                                method: "PUT",
                                headers: {
                                    'passcoder-access-token': passToken,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    push_id: userToken
                                })
                            }).then(async (res) => {
                                nav.replace("Passcoder");
                                setLoadingBiometrics(false);
                            }).catch((err) => {
                                setLoadingBiometrics(false);
                                Toast.show({
                                    type: "error",
                                    text1: "Error",
                                    text2: "An error occured!"
                                });
                            })
                        }
                    } else {
                        setLoadingBiometrics(false);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: res.status !== 422 ? response.message : response.data[0].msg
                        });
                    }
                }).catch((err) => {
                    setLoadingBiometrics(false);
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "An error occured!!"
                    });
                })
            } else {
                fetch(`${BaseUrl}/auth/user/signin/via/email/and/biometrics`, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify({
                        email: emailCredentials
                    })
                }).then(async (res) => {
                    const response = await res.json();
                    if (response.success) {
                        if (!response.data.token) {
                            Toast.show({
                                type: "success",
                                text1: "Notification",
                                text2: response.message
                            });
                            nav.navigate('Otp', { pid: null, email: emailCredentials });
                            setLoadingBiometrics(false);
                        } else {
                            await AsyncStorage.setItem('userToken', response.data.token);
                            await AsyncStorage.setItem('userPID', response.data.pid);
                            await AsyncStorage.setItem('userUID', response.data.uid);
                            await AsyncStorage.setItem('userEmail', emailCredentials);
                            const passToken = await AsyncStorage.getItem('userToken')
                            fetch(`${BaseUrl}/user/profile/pushid`, {
                                method: "PUT",
                                headers: {
                                    'passcoder-access-token': passToken,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    push_id: userToken
                                })
                            }).then(async (res) => {
                                nav.replace("Passcoder");
                                setLoadingBiometrics(false);
                            }).catch((err) => {
                                setLoadingBiometrics(false);
                                Toast.show({
                                    type: "error",
                                    text1: "Error",
                                    text2: "An error occured!"
                                });
                            })
                        }
                    } else {
                        setLoadingBiometrics(false);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: res.status !== 422 ? response.message : response.data[0].msg
                        });
                    }
                }).catch((err) => {
                    setLoadingBiometrics(false);
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "An error occured!!"
                    });
                })
            }    
        }

    };

    return (
        Platform.OS === "ios" ?
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.wrapper}>

                        <View style={{ alignItems: "center", justifyContent: "center", flex: 1, marginBottom: -70, marginTop: -30 }}>
                            <Image resizeMode='contain' style={{ width: 100, height: 130 }} source={require('../../assets/img/app-launch.png')} />
                            <Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, marginTop: 10, fontSize: 20 }}>Sign In</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-around", backgroundColor: "#fff", margin: 15, padding: 10, borderRadius: 8 }}>
                                {methodData.map((data, index) => (
                                    <TouchableOpacity onPress={() => setMethod(data.title)} key={index} style={[styles.touchStyle, { backgroundColor: method === data.title ? AppColor.Blue : null }]}>
                                        <Text style={{ fontFamily: "lexendBold", color: method === data.title ? "#fff" : AppColor.BoldGrey }}>{data.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={{ marginLeft: 15, marginRight: 15, marginTop: 5 }}>
                                {method === "Email" ? (
                                    <View style={{ backgroundColor: "#fff", height: 300, borderRadius: 8 }}>
                                        <View style={{ margin: 15, marginTop: 15 }}>
                                            <TextInput
                                                keyboardType='email-address'
                                                onChangeText={(txt) => setEmail(txt)}
                                                style={styles.textInput}
                                                placeholder='Email address' />
                                            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, marginBottom: 20, justifyContent: "center", borderRadius: 8 }}>
                                                <TextInput
                                                    secureTextEntry={showEmailpassword}
                                                    onChangeText={(txt) => setPassword(txt)}
                                                    style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
                                                    placeholder='Password' />
                                                <TouchableOpacity onPress={() => setShowEmailPass(!showEmailpassword)}>
                                                    <Ionicons name={!showEmailpassword ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                                <TouchableOpacity disabled={loading || loadingBiometrics} style={styles.btnStyle} onPress={Signin}>
                                                    {loading ? (
                                                        <ActivityIndicator size={'small'} color={AppColor.White} />
                                                    ) : (
                                                        <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Login</Text>
                                                    )}
                                                </TouchableOpacity>
                                                
                                                <TouchableOpacity disabled={!isBiometricSupported || !isBiometricEnrolled || !isCredentialsAvailable || !isBiometricMethodAvailable || loading || loadingBiometrics} style={{ ...styles.btnStyle2, backgroundColor: `${isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? AppColor.Blue : "grey"}`}} onPress={handleBiometricAuth}>
                                                    {
                                                        loadingBiometrics ? (
                                                            <ActivityIndicator size={'small'} color={'#fff'} />
                                                        ) : (
                                                            biometricMethod === "fingerprint" ? 
                                                                <MaterialCommunityIcons name={isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? "fingerprint" : "fingerprint-off"} size={30} color="white" /> : 
                                                                <MaterialCommunityIcons name={isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? "face-recognition" : "face-recognition"} size={30} color="white" />
                                                        )
                                                    }
                                                </TouchableOpacity>
                                            </View>

                                            <Text style={{ fontFamily: "lexendBold", textAlign: "right", marginTop: 10, marginBottom: 5, textDecorationLine: "underline" }} onPress={() => nav.navigate('ForgotPassword')}>Forgot password?</Text>
                                            <Text onPress={() => nav.navigate('Register')} style={{ fontFamily: "lexendBold", textAlign: "center", marginTop: 5 }}>Don't have an account?<Text style={{ color: AppColor.Blue }}>{" "}Sign Up</Text> </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={{ backgroundColor: "#fff", height: 300, borderRadius: 8 }}>
                                        <View style={{ margin: 15, marginTop: 15 }}>
                                            <TextInput 
                                                keyboardType='default' 
                                                autoCapitalize='characters' 
                                                value={Pid} maxLength={6} 
                                                style={styles.textInput} 
                                                placeholder={userRemind || "Your PID"} 
                                                onChangeText={(txt) => setPid(txt)} />
                                            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, marginBottom: 20, justifyContent: "center", borderRadius: 8 }}>
                                                <TextInput
                                                    maxLength={4}
                                                    keyboardType='number-pad'
                                                    secureTextEntry={showEmailpassword}
                                                    onChangeText={(txt) => setPidpin(txt)}
                                                    style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
                                                    placeholder='Pin' />
                                                <TouchableOpacity onPress={() => setShowEmailPass(!showEmailpassword)}>
                                                    <Ionicons name={!showEmailpassword ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                                <TouchableOpacity disabled={loading || loadingBiometrics} style={styles.btnStyle} onPress={LoginWithPID}>
                                                    {loading ? (
                                                        <ActivityIndicator size={'small'} color={'#fff'} />
                                                    ) : (
                                                        <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Login</Text>
                                                    )}
                                                </TouchableOpacity>
                                                
                                                <TouchableOpacity disabled={!isBiometricSupported || !isBiometricEnrolled || !isCredentialsAvailable || !isBiometricMethodAvailable || loading || loadingBiometrics} style={{ ...styles.btnStyle2, backgroundColor: `${isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? AppColor.Blue : "grey"}` }} onPress={handleBiometricAuth}>
                                                    {
                                                        loadingBiometrics ? (
                                                            <ActivityIndicator size={'small'} color={'#fff'} />
                                                        ) : (
                                                            biometricMethod === "fingerprint" ?
                                                                <MaterialCommunityIcons name={isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? "fingerprint" : "fingerprint-off"} size={30} color="white" /> :
                                                                <MaterialCommunityIcons name={isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? "face-recognition" : "face-recognition"} size={30} color="white" />
                                                        )
                                                    }
                                                </TouchableOpacity>
                                            </View>
                                            <Text style={{ fontFamily: "lexendBold", textAlign: "center", marginTop: 10 }}>Don't have an account?<Text onPress={() => nav.navigate('Register')} style={{ color: AppColor.Blue }}>{" "}Sign Up</Text> </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView> :
            <View style={styles.wrapper}>

                <View style={{ alignItems: "center", justifyContent: "center", flex: 1, marginBottom: -70, marginTop: -30 }}>
                    <Image resizeMode='contain' style={{ width: 100, height: 130 }} source={require('../../assets/img/app-launch.png')} />
                    <Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, marginTop: 10, fontSize: 20 }}>Sign In</Text>
                </View>

                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-around", backgroundColor: "#fff", margin: 15, padding: 10, borderRadius: 8 }}>
                        {methodData.map((data, index) => (
                            <TouchableOpacity onPress={() => setMethod(data.title)} key={index} style={[styles.touchStyle, { backgroundColor: method === data.title ? AppColor.Blue : null }]}>
                                <Text style={{ fontFamily: "lexendBold", color: method === data.title ? "#fff" : AppColor.BoldGrey }}>{data.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ marginLeft: 15, marginRight: 15, marginTop: 5 }}>
                        {method === "Email" ? (
                            <View style={{ backgroundColor: "#fff", height: 300, borderRadius: 8 }}>
                                <View style={{ margin: 15, marginTop: 15 }}>
                                    <TextInput
                                        keyboardType='email-address'
                                        onChangeText={(txt) => setEmail(txt)}
                                        style={styles.textInput}
                                        placeholder='Email address' />
                                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, marginBottom: 20, justifyContent: "center", borderRadius: 8 }}>
                                        <TextInput
                                            secureTextEntry={showEmailpassword}
                                            onChangeText={(txt) => setPassword(txt)}
                                            style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
                                            placeholder='Password' />
                                        <TouchableOpacity onPress={() => setShowEmailPass(!showEmailpassword)}>
                                            <Ionicons name={!showEmailpassword ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                        <TouchableOpacity disabled={loading || loadingBiometrics} style={styles.btnStyle} onPress={Signin}>
                                            {loading ? (
                                                <ActivityIndicator size={'small'} color={AppColor.White} />
                                            ) : (
                                                <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Login</Text>
                                            )}
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity disabled={!isBiometricSupported || !isBiometricEnrolled || !isCredentialsAvailable || !isBiometricMethodAvailable || loading || loadingBiometrics} style={{ ...styles.btnStyle2, backgroundColor: `${isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? AppColor.Blue : "grey"}`}} onPress={handleBiometricAuth}>
                                            {
                                                loadingBiometrics ? (
                                                    <ActivityIndicator size={'small'} color={'#fff'} />
                                                ) : (
                                                    biometricMethod === "fingerprint" ? 
                                                        <MaterialCommunityIcons name={isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? "fingerprint" : "fingerprint-off"} size={30} color="white" /> : 
                                                        <MaterialCommunityIcons name={isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? "face-recognition" : "face-recognition"} size={30} color="white" />
                                                )
                                            }
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={{ fontFamily: "lexendBold", textAlign: "right", marginTop: 10, marginBottom: 5, textDecorationLine: "underline" }} onPress={() => nav.navigate('ForgotPassword')}>Forgot password?</Text>
                                    <Text onPress={() => nav.navigate('Register')} style={{ fontFamily: "lexendBold", textAlign: "center", marginTop: 5 }}>Don't have an account?<Text style={{ color: AppColor.Blue }}>{" "}Sign Up</Text> </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={{ backgroundColor: "#fff", height: 300, borderRadius: 8 }}>
                                <View style={{ margin: 15, marginTop: 15 }}>
                                    <TextInput 
                                        keyboardType='default' 
                                        autoCapitalize='characters' 
                                        value={Pid} maxLength={6} 
                                        style={styles.textInput} 
                                        placeholder={userRemind || "Your PID"} 
                                        onChangeText={(txt) => setPid(txt)} />
                                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, marginBottom: 20, justifyContent: "center", borderRadius: 8 }}>
                                        <TextInput
                                            maxLength={4}
                                            keyboardType='number-pad'
                                            secureTextEntry={showEmailpassword}
                                            onChangeText={(txt) => setPidpin(txt)}
                                            style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
                                            placeholder='Pin' />
                                        <TouchableOpacity onPress={() => setShowEmailPass(!showEmailpassword)}>
                                            <Ionicons name={!showEmailpassword ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                        <TouchableOpacity disabled={loading || loadingBiometrics} style={styles.btnStyle} onPress={LoginWithPID}>
                                            {loading ? (
                                                <ActivityIndicator size={'small'} color={'#fff'} />
                                            ) : (
                                                <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Login</Text>
                                            )}
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity disabled={!isBiometricSupported || !isBiometricEnrolled || !isCredentialsAvailable || !isBiometricMethodAvailable || loading || loadingBiometrics} style={{ ...styles.btnStyle2, backgroundColor: `${isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? AppColor.Blue : "grey"}` }} onPress={handleBiometricAuth}>
                                            {
                                                loadingBiometrics ? (
                                                    <ActivityIndicator size={'small'} color={'#fff'} />
                                                ) : (
                                                    biometricMethod === "fingerprint" ?
                                                        <MaterialCommunityIcons name={isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? "fingerprint" : "fingerprint-off"} size={30} color="white" /> :
                                                        <MaterialCommunityIcons name={isBiometricSupported && isBiometricEnrolled && isCredentialsAvailable && isBiometricMethodAvailable ? "face-recognition" : "face-recognition"} size={30} color="white" />
                                                )
                                            }
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={{ fontFamily: "lexendBold", textAlign: "center", marginTop: 10 }}>Don't have an account?<Text onPress={() => nav.navigate('Register')} style={{ color: AppColor.Blue }}>{" "}Sign Up</Text> </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        // justifyContent: "center",
        // alignItems: "center"
    },
    touchStyle: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        width: 150,
        borderRadius: 8
    },
    textInput: {
        backgroundColor: "#eee",
        height: 50,
        borderRadius: 8,
        paddingLeft: 20,
        fontFamily: "lexendBold",
        marginBottom: 20,

    },
    btnStyle: {
        height: 45,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        width: (Dimensions.get("window").width * 60) / 100
    },
    btnStyle2: {
        height: 45,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        width: (Dimensions.get("window").width * 20) / 100
    }
})