import { ActivityIndicator, Dimensions, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Platform } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { AppColor } from '../../../utils/Color';
import { BaseUrl } from '../../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import storage from '@react-native-firebase/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validate_past_date, user_bucket_url, allowed_extensions, maximum_file_size, validate_future_end_date, return_trimmed_data } from '../../../utils/Validations';

export default function Primary() {

    const nav = useNavigation();

    const [uploading, setUploading] = useState(false);

    const [name, setName] = useState('');
    const [fromYear, setFromYear] = useState('');
    const [toYear, setToYear] = useState('');

    const [isPickerShowFromYear, setIsPickerShowFromYear] = useState(false);
    const [isPickerShowToYear, setIsPickerShowToYear] = useState(false);
    const [dateFromYear, setDateFromYear] = useState(new Date(Date.now()));
    const [dateToYear, setDateToYear] = useState(new Date(Date.now()));

    const showPickerFromYear = () => {
        setIsPickerShowFromYear(true);
    };

    const showPickerToYear = () => {
        setIsPickerShowToYear(true);
    };

    const onChangeFromYear = (event, value) => {
        setDateFromYear(value);
        setFromYear(value);
        if (Platform.OS === 'android') {
            setIsPickerShowFromYear(false);
        }
    };

    const onChangeToYear = (event, value) => {
        setDateToYear(value);
        setToYear(value);
        if (Platform.OS === 'android') {
            setIsPickerShowToYear(false);
        }
    };

    const [proof, setProof] = useState('');
    const [preview, setPreview] = useState({});

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

    async function UploadPrimary() {
        const _from_year = new Date(fromYear).getFullYear();
        const _to_year = new Date(toYear).getFullYear();

        if (!name) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Name is required"
            })
        } else if (name.length < 3 || name.length > 200) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Name | Invalid length"
            })
        } else if (!fromYear) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "From Year is required"
            })
        } else if (!validate_past_date(_from_year)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid from year"
            })
        } else if (!toYear) {
        	Toast.show({
        		type: "error",
        		text1: "Error",
        		text2: "To Year is required"
        	})
        } else if (!validate_future_end_date(_from_year, _to_year)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid to year"
            })
        } else if (!proof || proof.length === 0) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Certificate Proof is required"
            })
        } else {
            setUploading(true);

            const userToken = await AsyncStorage.getItem('userToken');
            const userPID = await AsyncStorage.getItem('userPID');

            fetch(`${BaseUrl}/proofs/credentials/primary/school`, {
                method: "POST",
                headers: {
                    'passcoder-access-token': userToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pid: userPID
                })
            }).then(async (res) => {
                const proof_res = await res.json();
                const proof_rename = proof_res.data[0].proof;

                fetch(`${BaseUrl}/user/primary/school/add`, {
                    method: "POST",
                    headers: {
                        'passcoder-access-token': userToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: return_trimmed_data(name),
                        from_year: _from_year.toString(),
                        to_year: _to_year.toString()
                    })
                }).then(async (res) => {
                    const upload_details_res = await res.json();

                    if (upload_details_res.success) {
                        let lastDot = proof.lastIndexOf('.');
                        let ext = proof.substring(lastDot + 1);

                        const new_proof_name = proof_rename + "." + ext;
                        const proof_path = "/users/" + new_proof_name;

                        const reference = storage().refFromURL(`${user_bucket_url}${new_proof_name}`);
                        await reference.putFile(proof).then(async () => {
                            const url = await storage().refFromURL(`${user_bucket_url}${new_proof_name}`).getDownloadURL().then((res) => {
                                fetch(`${BaseUrl}/user/primary/school/edit/proofs`, {
                                    method: "POST",
                                    headers: {
                                        'passcoder-access-token': userToken,
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        proof: res,
                                        proof_file_ext: proof_path
                                    })
                                }).then(async (res) => {
                                    const upload_proof_res = await res.json();

                                    if (upload_proof_res.success) {
                                        setUploading(false);
                                        Toast.show({
                                            type: "success",
                                            text1: "Success",
                                            text2: "Details uploaded successfully!"
                                        })
                                        nav.goBack();
                                    } else {
                                        setUploading(false);
                                        Toast.show({
                                            type: "error",
                                            text1: "Error",
                                            text2: upload_proof_res.message
                                        })
                                    }
                                }).catch((err) => {
                                    setUploading(false);
                                    Toast.show({
                                        type: "error",
                                        text1: "Error",
                                        text2: "An error occured"
                                    })
                                })
                            })
                        })
                    } else {
                        setUploading(false);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: res.status !== 422 ? upload_details_res.message : upload_details_res.data[0].msg
                        });
                    }
                })
            })
        }
    }
    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.wrapper}>

                {/*Top*/}
                <View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                    <View>
                        <Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Primary School</Text>
                        <Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Upload your first school leaving certificate</Text>
                    </View>
                    <View>

                    </View>
                </View>


                <View style={{ margin: 15 }}>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.topText}>Name of School</Text>
                        <TextInput
                            maxLength={200}
                            onChangeText={(txt) => setName(txt)}
                            style={styles.topInput}
                            placeholder='Enter school name'
                        />
                    </View>
                    <View style={{ marginBottom: 20, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.topText}>From Year</Text>
                            <TouchableOpacity onPress={showPickerFromYear} style={{ flexDirection: "row", marginTop: 15, backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                {(!isPickerShowFromYear || Platform.OS === "android") && (
                                    <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{fromYear ? `${new Date(fromYear).getFullYear()}` : "YYYY"}</Text>
                                )}
                                {(isPickerShowFromYear && Platform.OS === "ios") && (
                                    <DateTimePicker
                                        value={dateFromYear}
                                        mode={'date'}
                                        maximumDate={new Date()}
                                        display={Platform.OS === 'ios' ? 'default' : 'spinner'}
                                        is24Hour={true}
                                        onChange={onChangeFromYear}
                                    />
                                )}
                                <Ionicons name="calendar-sharp" size={24} color="grey" style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: 25 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.topText}>To Year</Text>
                            <TouchableOpacity onPress={showPickerToYear} style={{ flexDirection: "row", marginTop: 15, backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                {(!isPickerShowToYear || Platform.OS === "android") && (
                                    <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{toYear ? `${new Date(toYear).getFullYear()}` : "YYYY"}</Text>
                                )}
                                {(isPickerShowToYear && Platform.OS === "ios") && (
                                    <DateTimePicker
                                        value={dateToYear}
                                        mode={'date'}
                                        maximumDate={new Date()}
                                        display={Platform.OS === 'ios' ? 'default' : 'spinner'}
                                        is24Hour={true}
                                        onChange={onChangeToYear}
                                    />
                                )}
                                <Ionicons name="calendar-sharp" size={24} color="grey" style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Proof</Text>
                        <TouchableOpacity onPress={pickProof} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                            <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{preview?.extension ? `${preview?.extension + " - " + preview?.size + "MB"}` : "Upload Certificate"}</Text>
                            <Ionicons name="cloud-upload-outline" size={24} color="grey" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    </View>
                </View>

                {
                    preview?.extension && preview?.extension !== "PDF" ?
                        <View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
                            <Image style={{ height: 250, width: 250 }} resizeMode='contain' source={{ uri: preview?.file }} />
                        </View> : ""
                }

                <View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
                    <TouchableOpacity onPress={UploadPrimary} disabled={uploading} style={styles.uploadButton}>
                        {uploading ? (
                            <ActivityIndicator color={"#fff"} size={'small'} />
                        ) : (
                            <Text style={{ fontFamily: 'lexendMedium', color: "#fff" }}>Upload</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* The date picker */}
                {(isPickerShowFromYear && Platform.OS === "android") && (
                    <DateTimePicker
                        value={dateFromYear}
                        mode={'date'}
                        maximumDate={new Date()}
                        display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
                        is24Hour={true}
                        onChange={onChangeFromYear}
                        style={styles.datePicker}
                    />
                )}

                {/* The date picker */}
                {(isPickerShowToYear && Platform.OS === "android") && (
                    <DateTimePicker
                        value={dateToYear}
                        mode={'date'}
                        maximumDate={new Date()}
                        display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
                        is24Hour={true}
                        onChange={onChangeToYear}
                        style={styles.datePicker}
                    />
                )}
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    },
    topText: {
        fontFamily: "lexendMedium",
    },
    topInput: {
        height: 45,
        borderRadius: 8,
        paddingLeft: 20,
        paddingRight: 20,
        fontFamily: "lexendMedium",
        backgroundColor: "#eee",
        color: "#000",
        marginTop: 15
    },
    uploadButton: {
        width: 300,
        height: 45,
        borderRadius: 8,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center"
    },
    // This only works on iOS
    datePicker: {
        width: Dimensions.get('screen').width,
        height: 200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
})