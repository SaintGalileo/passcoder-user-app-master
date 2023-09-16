import { ActivityIndicator, Dimensions, Modal, ScrollView, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { AppColor } from '../../../utils/Color';
import { BaseUrl } from '../../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import storage from '@react-native-firebase/storage';
import { Switch } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validate_past_date, validate_future_end_date, user_bucket_url, allowed_extensions, maximum_file_size, return_trimmed_data } from '../../../utils/Validations';

export default function WorkEdit({route}) {

    const [proof, setProof] = useState('');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState({})

    const [organisationName, setOrganisationName] = useState('');
    const [jobRole, setJobRole] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [currentlyWorking, setCurrentlyWorking] = useState(false);
    const [fromYearMonth, setFromYearMonth] = useState('');
    const [toYearMonth, setToYearMonth] = useState('');

    const [isPickerShowFromYearMonth, setIsPickerShowFromYearMonth] = useState(false);
    const [isPickerShowToYearMonth, setIsPickerShowToYearMonth] = useState(false);
    const [dateFromYearMonth, setDateFromYearMonth] = useState(new Date(Date.now()));
    const [dateToYearMonth, setDateToYearMonth] = useState(new Date(Date.now()));

    const showPickerFromYearMonth = () => {
        setIsPickerShowFromYearMonth(true);
    };

    const showPickerToYearMonth = () => {
        setIsPickerShowToYearMonth(true);
    };

    const onChangeFromYearMonth = (event, value) => {
        setDateFromYearMonth(value);
        setFromYearMonth(value);
        if (Platform.OS === 'android') {
            setIsPickerShowFromYearMonth(false);
        }
    };

    const onChangeToYearMonth = (event, value) => {
        setDateToYearMonth(value);
        setToYearMonth(value);
        if (Platform.OS === 'android') {
            setIsPickerShowToYearMonth(false);
        }
    };

    const [verified, setVerified] = useState(false);

    const [oldProof, setOldProof] = useState(null);
    const [oldProofExt, setOldProofExt] = useState(null);

    const nav = useNavigation();

    async function GetWorkHistory() {
		setLoading(true);
		const userToken = await AsyncStorage.getItem('userToken')
		fetch(`${BaseUrl}/user/work/history`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'Accept': 'application/json',
				'Content-Type': 'application/json',

			},
			body: JSON.stringify({
				unique_id: route.params.unique_id
			})
		}).then(async (res) => {
			setLoading(false);
			const response = await res.json();
            setOrganisationName(response.data.organisation);
            setJobRole(response.data.role);
            setJobDescription(response.data.description);
            setCurrentlyWorking(response.data.end === null ? true : false);
            setFromYearMonth(response.data.start);
            setDateFromYearMonth(new Date(response.data.start));
            setToYearMonth(response.data.end === null ? '' : response.data.end);
            if (response.data.end) setDateToYearMonth(new Date(response.data.end));

            setVerified(response?.data?.verified);
            setOldProof(response?.data?.proof);

            let lastDotOldProof = response.data.proof ? response.data.proof.lastIndexOf('.') : null;
            let extOldProof = response.data.proof ? response.data.proof.substring(lastDotOldProof + 1) : null;
            setOldProofExt(extOldProof ? extOldProof.toUpperCase() : null);
		}).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
		})
	}

	useEffect(() => {
		GetWorkHistory()
	}, []);

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

    async function UpdateWork() {
        const _from_year_month_ = new Date(fromYearMonth);
        const _from_year_month = _from_year_month_.getFullYear() + "-" + ((_from_year_month_.getUTCMonth() + 1) < 10 ? "0" + (_from_year_month_.getUTCMonth() + 1) : (_from_year_month_.getUTCMonth() + 1));
        const _to_year_month_ = toYearMonth ? new Date(toYearMonth) : null;
        const _to_year_month = toYearMonth ? (_to_year_month_.getFullYear() + "-" + ((_to_year_month_.getUTCMonth() + 1) < 10 ? "0" + (_to_year_month_.getUTCMonth() + 1) : (_to_year_month_.getUTCMonth() + 1))) : null;
        //new start
        if (!organisationName) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Organisation is required"
            })
        } else if (organisationName.length < 3 || organisationName.length > 200) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Organisation | Invalid length"
            })
        } else if (!jobRole) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Role is required"
            })
        } else if (jobRole.length < 3 || jobRole.length > 200) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Role | Invalid length"
            })
        } else if (!jobDescription) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Description is required"
            })
        } else if (jobDescription.length < 3 || jobDescription.length > 65000) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Description | Invalid length"
            })
        } else if (!fromYearMonth) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "From Year & Month is required"
            })
        } else if (!validate_past_date(_from_year_month)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid from year & month"
            })
        } else if (toYearMonth && !validate_future_end_date(_from_year_month, _to_year_month)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid to year & month"
            })
        } /*else if (!proof || proof.length === 0) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Proof is required"
            })
        }*/ else {
            setUploading(true);

            const userToken = await AsyncStorage.getItem('userToken');
            const userPID = await AsyncStorage.getItem('userPID');

            fetch(`${BaseUrl}/proofs/credentials/work/history`, {
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

                fetch(`${BaseUrl}/user/work/history/edit/all`, {
                    method: "PUT",
                    headers: {
                        'passcoder-access-token': userToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        unique_id: route.params.unique_id,
                        organisation: return_trimmed_data(organisationName),
                        role: return_trimmed_data(jobRole),
                        description: jobDescription,
                        start: _from_year_month,
                        end: _to_year_month && _to_year_month.length > 0 ? _to_year_month : undefined
                    })
                }).then(async (res) => {
                    if (res.status === 204) {
                        
                        if (proof) {
                            let lastDot = proof.lastIndexOf('.');
                            let ext = proof.substring(lastDot + 1);

                            const new_proof_name = proof_rename + "." + ext;
                            const proof_path = "/users/" + new_proof_name;

                            const reference = storage().refFromURL(`${user_bucket_url}${new_proof_name}`);
                            await reference.putFile(proof).then(async () => {
                                const url = await storage().refFromURL(`${user_bucket_url}${new_proof_name}`).getDownloadURL().then((res) => {
                                    
                                    fetch(`${BaseUrl}/user/work/history/edit/proofs`, {
                                        method: "POST",
                                        headers: {
                                            'passcoder-access-token': userToken,
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            unique_id: route.params.unique_id,
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
                                                text2: "Details & proof updated successfully!"
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
                                            text2: "Error occured - 100"
                                        })
                                    })
                                })
                            })
                        } else {
                            setUploading(false);
                            Toast.show({
                                type: "success",
                                text1: "Success",
                                text2: "Details updated successfully!"
                            })
                            nav.goBack();
                        }
                    } else {
                        setUploading(false);
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: res.status !== 422 ? "Error occured while updating" : await res?.json().msg
                        });
                    }
                }).catch((err) => {
                    setUploading(false);
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "Error occured - 101"
                    })
                })
            })
        }
        //new end
    }

 
    return (
        <>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.wrapper}>

                    {/*Top*/}
                    <View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                        <View>
                            <Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Work History</Text>
                            <Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Update work history Details</Text>
                        </View>
                        <View>

                        </View>
                    </View>


                    <ScrollView style={{ marginBottom: 100 }}>
                        <View style={{ margin: 15 }}>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={styles.topText}>Name of Organisation</Text>
                                <TextInput
                                    onChangeText={(txt) => setOrganisationName(txt)}
                                    value={organisationName}
                                    style={styles.topInput}
                                    placeholder='Enter organisation name'
                                />
                            </View>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={styles.topText}>Job Role</Text>
                                <TextInput
                                    onChangeText={(txt) => setJobRole(txt)}
                                    value={jobRole}
                                    style={styles.topInput}
                                    placeholder='Enter Role / Position'
                                />
                            </View>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={styles.topText}>Job Description</Text>
                                <TextInput
                                    onChangeText={(txt) => setJobDescription(txt)}
                                    value={jobDescription}
                                    multiline={true}
                                    numberOfLines={4}
                                    style={[styles.topInputDescription, { height: 200, textAlignVertical: 'top' }]}
                                />
                            </View>

                            <View style={{ marginBottom: 20 }}>
                                <Text style={styles.topText}>From Year & Month</Text>
                                <TouchableOpacity onPress={showPickerFromYearMonth} style={{ flexDirection: "row", marginTop: 15, backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                    {(!isPickerShowFromYearMonth || Platform.OS === "android") && (
                                        <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{fromYearMonth ? `${new Date(fromYearMonth).getFullYear()}-${(new Date(fromYearMonth).getUTCMonth() + 1) < 10 ? "0" + (new Date(fromYearMonth).getUTCMonth() + 1) : (new Date(fromYearMonth).getUTCMonth() + 1)}` : "YYYY-MM"}</Text>
                                    )}
                                    {(isPickerShowFromYearMonth && Platform.OS === "ios") && (
                                        <DateTimePicker
                                            value={dateFromYearMonth}
                                            mode={'date'}
                                            maximumDate={new Date()}
                                            display={Platform.OS === 'ios' ? 'default' : 'spinner'}
                                            is24Hour={true}
                                            onChange={onChangeFromYearMonth}
                                        />
                                    )}
                                    <Ionicons name="calendar-sharp" size={24} color="grey" style={{ marginRight: 10 }} />
                                </TouchableOpacity>
                            </View>
                            
                            {
                                !currentlyWorking &&
                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={styles.topText}>To Year & Month</Text>
                                        <TouchableOpacity onPress={showPickerToYearMonth} style={{ flexDirection: "row", marginTop: 15, backgroundColor: "#eee", height: 45, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                            {(!isPickerShowToYearMonth || Platform.OS === "android") && (
                                                <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{toYearMonth ? `${new Date(toYearMonth).getFullYear()}-${(new Date(toYearMonth).getUTCMonth() + 1) < 10 ? "0" + (new Date(toYearMonth).getUTCMonth() + 1) : (new Date(toYearMonth).getUTCMonth() + 1)}` : "YYYY-MM"}</Text>
                                            )}
                                            {(isPickerShowToYearMonth && Platform.OS === "ios") && (
                                                <DateTimePicker
                                                    value={dateToYearMonth}
                                                    mode={'date'}
                                                    maximumDate={new Date()}
                                                    display={Platform.OS === 'ios' ? 'default' : 'spinner'}
                                                    is24Hour={true}
                                                    onChange={onChangeToYearMonth}
                                                />
                                            )}
                                            <Ionicons name="calendar-sharp" size={24} color="grey" style={{ marginRight: 10 }} />
                                        </TouchableOpacity>
                                    </View>
                            }

                            <View style={{ marginBottom: 10 }}>
                                <Text style={styles.topText}>
                                    Currently Working
                                </Text>
                            </View>
                            <View style={{ marginBottom: 20, flexDirection: "row" }}>
                                <Switch
                                    style={{ alignContent: "flex-start" }}
                                    onChange={() => {
                                        setToYearMonth(currentlyWorking ? dateToYearMonth : null);
                                        setCurrentlyWorking((prevData) => {
                                            return !prevData
                                        })
                                    }}
                                    trackColor={{ false: "grey", true: AppColor.Blue }}
                                    value={currentlyWorking}
                                />
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
                                <Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Proof</Text>
                                <TouchableOpacity onPress={pickProof} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                                    <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{preview?.extension ? `${preview?.extension + " - " + preview?.size + "MB"}` : "Upload Document"}</Text>
                                    <Ionicons name="cloud-upload-outline" size={24} color="grey" style={{ marginRight: 10 }} />
                                </TouchableOpacity>
                            </View>

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
                                <TouchableOpacity onPress={UpdateWork} disabled={uploading} style={styles.uploadButton}>
                                    {uploading ? (
                                        <ActivityIndicator color={"#fff"} size={'small'} />
                                    ) : (
                                        <Text style={{ fontFamily: 'lexendMedium', color: "#fff" }}>Save Changes</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                    }

                    {/* The date picker */}
                    {(isPickerShowFromYearMonth && Platform.OS === "android") && (
                        <DateTimePicker
                            value={dateFromYearMonth}
                            mode={'date'}
                            maximumDate={new Date()}
                            display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
                            is24Hour={true}
                            onChange={onChangeFromYearMonth}
                            style={styles.datePicker}
                        />
                    )}

                    {/* The date picker */}
                    {(isPickerShowToYearMonth && Platform.OS === "android") && (
                        <DateTimePicker
                            value={dateToYearMonth}
                            mode={'date'}
                            maximumDate={new Date()}
                            display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
                            is24Hour={true}
                            onChange={onChangeToYearMonth}
                            style={styles.datePicker}
                        />
                    )}
                </View>
            </TouchableWithoutFeedback>
        </>
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
    topInputDescription: {
        height: 45,
        borderRadius: 8,
        padding: 10,
        fontFamily: "lexendMedium",
        backgroundColor: "#eee",
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