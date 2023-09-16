import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import { AppColor } from '../../utils/Color';
import { BaseUrl } from '../../utils/Url';
import storage from '@react-native-firebase/storage';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, CameraType } from 'expo-camera';
import {  allowed_image_extensions, maximum_file_size, user_bucket_url } from '../../utils/Validations';

export default function UploadProfile({ route }) {
    const { img, id } = route.params;
    const nav = useNavigation();

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState({});
    const [previewVisible, setPreviewVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    let camera;
    const [showCamera, setCameraShow] = useState(false);
    const [type, setType] = useState(CameraType.front);
    const [permission, requestPermission] = Camera.useCameraPermissions();


    if (permission && !permission.granted) {
        requestPermission()
    }

    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    };

    function removeCamera() {
        setCameraShow(false);
    };

    function startCamera() {
        if (permission && permission.granted) {
            setCameraShow(true);
        } else {
            requestPermission()
        }
    };

    function cancelPhoto() {
        setPreviewVisible(false);
        setPreview({});
        setImage(null);
    }

    const takePhoto = async () => {
        if (!camera) return;
        const photo = await camera.takePictureAsync();
        setPreviewVisible(true);
        const result = await ImageCompressor.compress(photo.uri, {
            compressionMethod: 'auto',
        });
        setPreview({
            height: photo.height,
            file: result,
            width: photo.width,
        });
        setImage(result);
    };

    const pickImage = async () => {
        try {
            const documentSelection = await DocumentPicker.getDocumentAsync({ multiple: false, type: allowed_image_extensions });
            if (documentSelection.canceled === true) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Cancelled file select"
                })
            } else {
                setPreview({
                    size: ((documentSelection.assets[0].size / 1024) / 1024).toFixed(2),
                    extension: documentSelection.assets[0].mimeType.split("/")[1].toUpperCase(),
                    file: documentSelection.assets[0].uri
                });
                if (documentSelection.assets[0].size > maximum_file_size) {
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "File is too large (max 5mb)"
                    })
                } else {
                    setImage(documentSelection.assets[0].uri);
                }
            }

        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured while getting file system"
            })
        }
    };

    async function UploadImage() {
        setLoading(true);
        const userToken = await AsyncStorage.getItem('userToken');
        const userUID = await AsyncStorage.getItem('userUID');

        fetch(`${BaseUrl}/proofs/user/profile/photo${!id || id === "******" ? "/via/uid" : ""}`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                !id || id === "******" ? {
                    uid: userUID,
                } : {
                    pid: id
                }
            )
        }).then(async (res) => {
            const photo_res = await res.json();
            const photo_rename = photo_res.data[0].photo;

            if (photo_res.success === true) {
                let lastDot = image.lastIndexOf('.');
                let ext = image.substring(lastDot + 1);

                const new_photo_name = photo_rename + "." + ext;
                const photo_path = "/users/" + new_photo_name;

                const reference = storage().refFromURL(`${user_bucket_url}${new_photo_name}`);
                await reference.putFile(image).then(async () => {
                    const url = await storage().refFromURL(`${user_bucket_url}${new_photo_name}`).getDownloadURL().then((res) => {
                        fetch(`${BaseUrl}/user/profile/photo`, {
                            method: "PUT",
                            headers: {
                                'passcoder-access-token': userToken,
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                photo: res,
                                photo_file_ext: photo_path
                            })
                        }).then(async (res) => {
                            const upload_photo_res = await res.json();

                            if (upload_photo_res.success === true) {
                                Toast.show({
                                    type: "success",
                                    text1: "Success",
                                    text2: "Profile Photo Updated!"
                                })
                                setLoading(false);
                                nav.goBack();
                            } else {
                                Toast.show({
                                    type: "success",
                                    text1: "Success",
                                    text2: upload_photo_res.message
                                })
                            }
                        })
                    }).catch(() => {
                        setLoading(false)
                    })
                }).catch((err) => {
                    setLoading(false)
                })
            } else {
                setLoading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: res.status !== 422 ? photo_res.message : photo_res.data[0].msg
                });
            }
        }).catch((err) => {
            setLoading(false)
        })
    }
    return (
        <View style={styles.wrapper}>

            {/*Top bar*/}
            <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Upload Profile Image</Text>
                </View>
                <View />
            </View>

            <View style={{ alignItems: "center", marginTop: (Dimensions.get('screen').height * 1) / 100, marginBottom: (Dimensions.get('screen').height * 1) / 100 }}>
                <TouchableOpacity onPress={startCamera}>
                    <Image style={{ height: 100, width: 100, borderRadius: 100 }} source={{ uri: preview?.file || img }} />
                    {
                        !showCamera ? 
                            <Entypo name="camera" size={24} color="grey" style={{ position: "absolute", bottom: 0, right: -15 }} /> : 
                            null
                    }
                </TouchableOpacity>
                {
                    !showCamera ? 
                        <View style={{ alignItems: "center", marginTop: 50, width: 350 }}>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 16, marginBottom: 5, marginTop: 5 }}>Click on the image to snap a selfie.</Text>
                        </View> : 
                        null 
                }
            </View>
            {
                showCamera && !previewVisible ? 
                    <Camera style={styles.camera} autoFocus={true} focusDepth={1} ref={(r) => { camera = r }} type={type} ratio={"4:3"}></Camera> :
                    <Image style={styles.camera} source={{ uri: preview?.file }} />
            }

            {
                showCamera ? 
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center" }}>
                        {
                            previewVisible ? 
                                <TouchableOpacity onPress={cancelPhoto} disabled={loading} style={{ backgroundColor: loading ? "grey" : AppColor.Blue, height: 50, marginRight: 50, borderRadius: 50, padding: 10 }}>
                                    <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>
                                        <MaterialCommunityIcons name="cancel" size={30} style={{ position: "absolute", bottom: 0 }} />
                                    </Text>
                                </TouchableOpacity> : 
                                <TouchableOpacity onPress={removeCamera} disabled={loading} style={{ backgroundColor: loading ? "grey" : AppColor.Blue, height: 50, marginRight: 50, borderRadius: 50, padding: 10 }}>
                                    <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>
                                        <Feather name="camera-off" size={30} style={{ position: "absolute", bottom: 0 }} />
                                    </Text>
                                </TouchableOpacity>
                        }
                        <TouchableOpacity onPress={!previewVisible ? takePhoto : UploadImage} disabled={loading} style={{ backgroundColor: loading ? "grey" : AppColor.Blue, height: 50, marginRight: 50, borderRadius: 50, padding: 10 }}>
                            {
                                !previewVisible ? 
                                    <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>
                                        <Entypo name="camera" size={30} style={{ position: "absolute", bottom: 0 }} />
                                    </Text> : (
                                        loading ? 
                                            <ActivityIndicator color={"#fff"} size={'large'} /> : 
                                            <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>
                                                <Entypo name="check" size={30} style={{ position: "absolute", bottom: 0 }} />
                                            </Text>
                                    )
                            }
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleCameraType} disabled={loading} style={{ backgroundColor: loading ? "grey" : AppColor.Blue, height: 50, borderRadius: 50, padding: 10 }}>
                            <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>
                                    <Feather name="refresh-ccw" size={30} style={{ position: "absolute", bottom: 0 }} />
                            </Text>
                        </TouchableOpacity>
                    </View> : 
                    null
            }
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    },
    camera: {
        flex: 1,
        maxHeight: (Dimensions.get('screen').height * 50) / 100,
        margin: 20
    },
    buttonContainer: {
        position: "absolute",
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        marginTop: (Dimensions.get('screen').height * 50) / 100,
    },
})