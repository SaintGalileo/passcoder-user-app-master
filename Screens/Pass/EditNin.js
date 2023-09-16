import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AppColor } from '../../utils/Color';
import storage from '@react-native-firebase/storage';
import Modal from "react-native-modal";
import * as DocumentPicker from 'expo-document-picker';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validate_nin_and_bvn, validate_vNIN, user_bucket_url, allowed_extensions, maximum_file_size } from '../../utils/Validations';

export default function EditNin() {

    const nav = useNavigation();

    const [modalVisible, setModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(false);

    const [infoVirtualNINModal, setInfoVirtualNINModal] = useState(false);
    
    const [ninNumber, setNinNumber] = useState('');
    const [proofType, setProofType] = useState("NINS");

    const [proof, setProof] = useState(null);
    const [verified, setVerified] = useState(false);

    const [oldProof, setOldProof] = useState(null);
    const [oldProofExt, setOldProofExt] = useState(null);

    const pickProof = async () => {
        try {
			const documentSelection = await DocumentPicker.getDocumentAsync({ multiple: false, type: allowed_extensions });
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
                    setProof(documentSelection.assets[0].uri);
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

    async function GetUserNIN() {
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/nin`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            setNinNumber(response.data.nin)
            setProofType(response.data.proof_type)

            setVerified(response?.data?.verified);
            setOldProof(response?.data?.proof);

            let lastDotOldProof = response.data.proof ? response.data.proof.lastIndexOf('.') : null;
            let extOldProof = response.data.proof ? response.data.proof.substring(lastDotOldProof + 1) : null;
            setOldProofExt(extOldProof ? extOldProof.toUpperCase() : null);
        }).catch((err) => {
            Toast.show({
                type: 'error',
                text1: "Error",
                text2: "An error occured!"
            })
        })
    }

    useEffect(() => {
        GetUserNIN()
    }, []);
    
    // async function UpdateNin() {
    //     if (!ninNumber) {
    //         Toast.show({
    //             type: "error",
    //             text1: "Error",
    //             text2: "VNIN is required"
    //         })
    //     } else if (!validate_vNIN(ninNumber)) {
    //         Toast.show({
    //             type: "error",
    //             text1: "Error",
    //             text2: "Invalid VNIN"
    //         })
    //     } else {
    //         setUploading(true);

    //         const userToken = await AsyncStorage.getItem('userToken');
    //         const userPID = await AsyncStorage.getItem('userPID');
    //         const userUID = await AsyncStorage.getItem('userUID');

    //         fetch(`${BaseUrl}/proofs/bio/nin${!userPID || userPID === "******" ? "/via/uid" : ""}`, {
    //             method: "POST",
    //             headers: {
    //                 'passcoder-access-token': userToken,
    //                 'Accept': 'application/json',
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(
    //                 !userPID || userPID === "******" ? {
    //                     uid: userUID,
    //                     proof_type: proofType
    //                 } : {
    //                     pid: userPID,
    //                     proof_type: proofType
    //                 }
    //             )
    //         }).then(async (res) => {
    //             const proof_res = await res.json();
    //             const proof_rename = proof_res.data[0].proof;

    //             fetch(`${BaseUrl}/user/nin/edit`, {
    //                 method: "POST",
    //                 headers: {
    //                     'passcoder-access-token': userToken,
    //                     'Accept': 'application/json',
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                     vNIN: ninNumber,
    //                     proof_type: proofType
    //                 })
    //             }).then(async (res) => {

    //                 if (res.status === 204 || res.status === 200 || res.status === 201) {
    //                     const nin_verified_status = res.status === 204 ? false : true;

    //                     if (proof) {
    //                         let lastDot = proof.lastIndexOf('.');
    //                         let ext = proof.substring(lastDot + 1);
    
    //                         const new_proof_name = proof_rename + "." + ext;
    //                         const proof_path = "/users/" + new_proof_name;

    //                         const reference = storage().refFromURL(`${user_bucket_url}${new_proof_name}`);
    //                         await reference.putFile(proof).then(async () => {
    //                             const url = await storage().refFromURL(`${user_bucket_url}${new_proof_name}`).getDownloadURL().then((res) => {
                                    
    //                                 fetch(`${BaseUrl}/user/nin/edit/proofs`, {
    //                                     method: "POST",
    //                                     headers: {
    //                                         'passcoder-access-token': userToken,
    //                                         'Accept': 'application/json',
    //                                         'Content-Type': 'application/json',
    //                                     },
    //                                     body: JSON.stringify({
    //                                         proof: res,
    //                                         proof_file_ext: proof_path
    //                                     })
    //                                 }).then(async (res) => {
    
    //                                     if (res.status === 204 || res.status === 200 || res.status === 201) {
    //                                         setUploading(false);
    //                                         Toast.show({
    //                                             type: "success",
    //                                             text1: "Success",
    //                                             text2: `Details & proof updated ${nin_verified_status ? "& verified " : ""}successfully!`
    //                                         })
    //                                         nav.goBack();
    //                                     } else {
    //                                         const error_res = await res.json();
    //                                         setUploading(false);
    //                                         Toast.show({
    //                                             type: "error",
    //                                             text1: "Error",
    //                                             text2: res.status !== 422 ? "Error occured while updating" : error_res.data[0].msg
    //                                         });
    //                                     }
    //                                 }).catch((err) => {
    //                                     setUploading(false);
    //                                     Toast.show({
    //                                         type: "error",
    //                                         text1: "Error",
    //                                         text2: "An error occured"
    //                                     })
    //                                 })
    //                             })
    //                         })
    //                     } else {
    //                         setUploading(false);
    //                         Toast.show({
    //                             type: "success",
    //                             text1: "Success",
    //                             text2: `Details updated ${nin_verified_status ? "& verified " : ""}successfully!`
    //                         })
    //                         nav.goBack();
    //                     }
    //                 } else {
    //                     const error_res = await res.json();
    //                     setUploading(false);
    //                     Toast.show({
    //                         type: "error",
    //                         text1: "Error",
    //                         text2: res.status !== 422 ? "Error occured while updating" : error_res.data[0].msg
    //                     });
    //                 }
    //             }).catch((err) => {
    //                 setUploading(false);
    //                 Toast.show({
    //                     type: "error",
    //                     text1: "Error",
    //                     text2: "An error occured"
    //                 });
    //             })
    //         })
    //     }
    //     //new end
    // };

    async function UpdateNin() {
        if (!ninNumber) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "VNIN is required"
            })
        } else if (!validate_vNIN(ninNumber)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid VNIN"
            })
        } else {
            setUploading(true);

            const userToken = await AsyncStorage.getItem('userToken');
            const userPID = await AsyncStorage.getItem('userPID');
            const userUID = await AsyncStorage.getItem('userUID');

            fetch(`${BaseUrl}/user/nin/edit`, {
                method: "POST",
                headers: {
                    'passcoder-access-token': userToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vNIN: ninNumber,
                    proof_type: proofType
                })
            }).then(async (res) => {

                if (res.status === 204 || res.status === 200 || res.status === 201) {
                    const nin_verified_status = res.status === 204 ? false : true;

                    setUploading(false);
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: `Details updated ${nin_verified_status ? "& verified " : ""}successfully!`
                    })
                    nav.goBack();
                } else {
                    const error_res = await res.json();
                    setUploading(false);
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: res.status !== 422 ? "Error occured while updating" : error_res.data[0].msg
                    });
                }
            }).catch((err) => {
                setUploading(false);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "An error occured"
                });
            })
        }
        //new end
    };

    const Showmodal = () => {
        return (
            <Modal onBackdropPress={() => setModalVisible(false)} onBackButtonPress={() => setModalVisible(false)} isVisible={modalVisible} style={{ margin: 0 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ height: 200, width: Dimensions.get('screen').width, backgroundColor: "#fff", bottom: 0, position: "absolute" }}>
                        <Text style={{ margin: 15, fontFamily: "lexendMedium", color: "red" }} onPress={() => setModalVisible(false)}>Cancel</Text>
                        <View style={{ height: 5, width: Dimensions.get('screen').width, backgroundColor: "#eee" }} />
                        <View style={{ margin: 15 }}>
                            <TouchableOpacity style={{ marginBottom: 30 }} onPress={() => {
                                setProofType('NIMC');
                                setModalVisible(false)
                            }}>
                                <Text style={{ fontFamily: "lexendBold", color: `${proofType === "NIMC" ? "blue" : ""}` }}>NIMC</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginBottom: 10 }} onPress={() => {
                                setProofType('NINS');
                                setModalVisible(false)
                            }}>
                                <Text style={{ fontFamily: "lexendBold", color: `${proofType === "NINS" ? "blue" : ""}` }}>NINS</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    const InfoVirtualNIN = () => {
        return (
            <Modal style={{ margin: 0 }} onBackdropPress={() => setInfoVirtualNINModal(false)} onBackButtonPress={() => setInfoVirtualNINModal(false)} isVisible={infoVirtualNINModal}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 15 }}>
                            <MaterialIcons name={"info"} size={40} color={AppColor.Blue} />
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginTop: 20, marginBottom: 10 }}>
                            <Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>About VNIN</Text>
                        </View>
                        <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>1. Download, Install and configure the NIMC Mobile ID app on a smartphone. (Instead of the initial 11 digits, you now have to provide the 16 digits generated from the NIMC app)</Text>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>2. To generate a Virtual NIN via USSD;</Text>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5, alignSelf: "center" }}>Dial *346*3*Your NIN*696739#.</Text>
                            <Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 15 }}>An SMS message will be returned containing the Virtual NIN generated for you.</Text>
                            <TouchableOpacity onPress={() => setInfoVirtualNINModal(false)} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
                                <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };

    return (
        <>
            <Showmodal />
            <InfoVirtualNIN />
            {
                Platform.OS === "ios" ?
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.wrapper}>
                                {/*Top bar*/}
                                <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                    <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>National Identification Number</Text>
                                        <Text style={{ fontFamily: "lexendLight" }}>Upload and verify your vNIN</Text>
                                        {/* <Text style={{ fontFamily: "lexendLight" }}>Update NIN and document proof</Text> */}
                                    </View>
                                    <View />
                                </View>

                                <ScrollView style={{ marginBottom: 100 }}>
                                    <View style={{ margin: 15, marginTop: 30 }}>
                                        <View style={{ marginBottom: 20 }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                                <Text style={{ fontFamily: "lexendBold" }}>VNIN</Text>
                                                <Text onPress={() => setInfoVirtualNINModal(true)} style={{ fontSize: 12, fontFamily: "lexendMedium", color: AppColor.Blue, textDecorationLine: "underline" }}>More info</Text>
                                            </View>
                                            <TextInput
                                                value={ninNumber}
                                                onChangeText={(txt) => setNinNumber(txt)}
                                                maxLength={16}
                                                autoCapitalize='characters' 
                                                keyboardType='default'
                                                style={styles.inputStyle}
                                                placeholder='Enter Virtual NIN'
                                            />
                                        </View>

                                        {/* <View style={{ marginBottom: 20 }}>
                                            <Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Document type</Text>
                                            <TouchableOpacity onPress={() => setModalVisible(true)} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                                <Text style={{ fontFamily: "lexendBold", color: 'grey', paddingLeft: 20 }}>{proofType}</Text>
                                                <MaterialIcons name="arrow-drop-down" size={24} color="grey" style={{ marginRight: 10 }} />
                                            </TouchableOpacity>
                                        </View>

                                        {
                                            oldProof ?
                                                <View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
                                                    <Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Current Proof</Text>
                                                    {
                                                        oldProofExt !== "PDF" ?
                                                            <Image style={{ height: 300, width: 250 }} resizeMode='contain' source={{ uri: oldProof }} /> :
                                                            <Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>{oldProof.split("/")[4]}</Text>
                                                    }
                                                </View> : ""
                                        }

                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Proof</Text>
                                            <TouchableOpacity onPress={pickProof} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                                <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{preview?.extension ? `${preview?.extension + " - " + preview?.size + "MB"}` : "Upload Document"}</Text>
                                                <Ionicons name="cloud-upload-outline" size={24} color="grey" style={{ marginRight: 10 }} />
                                            </TouchableOpacity>
                                        </View> */}

                                        {
                                            preview?.extension && preview?.extension !== "PDF" ?
                                                <View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
                                                    <Image style={{ height: 250, width: 250 }} resizeMode='contain' source={{ uri: preview?.file }} />
                                                </View> : ""
                                        }
                                    </View>
                                </ScrollView>

                                {
                                    verified ?
                                        "" :
                                        <View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
                                            <TouchableOpacity disabled={uploading} onPress={UpdateNin} style={{ backgroundColor: AppColor.Blue, height: 50, justifyContent: "center", alignItems: "center", width: 300, borderRadius: 8 }}>
                                                {uploading ? (
                                                    <ActivityIndicator color={'#fff'} size={'small'} />
                                                ) : (
                                                    <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Save Changes</Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                }
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView> :
                    <View style={styles.wrapper}>
                        {/*Top bar*/}
                        <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                            <View style={{ alignItems: "center" }}>
                                <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>National Identification Number</Text>
                                <Text style={{ fontFamily: "lexendLight" }}>Upload and verify your vNIN</Text>
                                {/* <Text style={{ fontFamily: "lexendLight" }}>Update NIN and document proof</Text> */}
                            </View>
                            <View />
                        </View>

                        <ScrollView style={{ marginBottom: 100 }}>
                            <View style={{ margin: 15, marginTop: 30 }}>
                                <View style={{ marginBottom: 20 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                        <Text style={{ fontFamily: "lexendBold" }}>VNIN</Text>
                                        <Text onPress={() => setInfoVirtualNINModal(true)} style={{ fontSize: 12, fontFamily: "lexendMedium", color: AppColor.Blue, textDecorationLine: "underline" }}>More info</Text>
                                    </View>
                                    <TextInput
                                        value={ninNumber}
                                        onChangeText={(txt) => setNinNumber(txt)}
                                        maxLength={16}
                                        autoCapitalize='characters' 
                                        keyboardType='default'
                                        style={styles.inputStyle}
                                        placeholder='Enter Virtual NIN'
                                    />
                                </View>

                                {/* <View style={{ marginBottom: 20 }}>
                                    <Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Document type</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(true)} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                        <Text style={{ fontFamily: "lexendBold", color: 'grey', paddingLeft: 20 }}>{proofType}</Text>
                                        <MaterialIcons name="arrow-drop-down" size={24} color="grey" style={{ marginRight: 10 }} />
                                    </TouchableOpacity>
                                </View>

                                {
                                    oldProof ?
                                        <View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
                                            <Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Current Proof</Text>
                                            {
                                                oldProofExt !== "PDF" ?
                                                    <Image style={{ height: 300, width: 250 }} resizeMode='contain' source={{ uri: oldProof }} /> :
                                                    <Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>{oldProof.split("/")[4]}</Text>
                                            }
                                        </View> : ""
                                }

                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{ fontFamily: "lexendBold", marginBottom: 10 }}>Proof</Text>
                                    <TouchableOpacity onPress={pickProof} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                        <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{preview?.extension ? `${preview?.extension + " - " + preview?.size + "MB"}` : "Upload Document"}</Text>
                                        <Ionicons name="cloud-upload-outline" size={24} color="grey" style={{ marginRight: 10 }} />
                                    </TouchableOpacity>
                                </View> */}

                                {
                                    preview?.extension && preview?.extension !== "PDF" ?
                                        <View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
                                            <Image style={{ height: 250, width: 250 }} resizeMode='contain' source={{ uri: preview?.file }} />
                                        </View> : ""
                                }
                            </View>
                        </ScrollView>

                        {
                            verified ?
                                "" :
                                <View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
                                    <TouchableOpacity disabled={uploading} onPress={UpdateNin} style={{ backgroundColor: AppColor.Blue, height: 50, justifyContent: "center", alignItems: "center", width: 300, borderRadius: 8 }}>
                                        {uploading ? (
                                            <ActivityIndicator color={'#fff'} size={'small'} />
                                        ) : (
                                            <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Save Changes</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                        }
                    </View>
            }
        </>

    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    },
    inputStyle: {
        height: 50,
        backgroundColor: "#eee",
        borderRadius: 8,
        paddingLeft: 20,
        fontFamily: "lexendBold"
    }
})