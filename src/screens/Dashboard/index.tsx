import React, { FC, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Modal,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { useQuery } from '@apollo/client';
import {
	AnimateDirections,
	BindDirections,
	modalActions,
	Text,
} from '@metacraft/ui';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Editing from 'components/modals/Editing';
import SignInOptions from 'components/modals/SignInOptions';
import SearchModal from 'components/SearchModal';
import { RootParamList } from 'stacks/shared';
import * as queries from 'utils/graphql/query';
import { useSnapshot } from 'utils/hook';
import { accountState } from 'utils/state/account';

import ControllerRow from '../../components/ControllerRow';
import Post from '../../components/Post';
import { blackPearl, blueWhale, grey } from '../../utils/colors';
import { MAX_WIDTH } from '../../utils/constants';
import { threads } from '../../utils/mockupData';
import { Thread } from '../../utils/types/thread';

type StackProp = NavigationProp<RootParamList>;

export const BuildDashboard: FC = () => {
	const { profile } = useSnapshot(accountState);
	const [simpleThreads, setSimpleThreads] = useState<Array<Thread>>([]);
	const navigation = useNavigation<StackProp>();
	const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
	const { data } = useQuery(queries.feedThreads);
	const onAvatarPress = () => {
		navigation.navigate('SignIn');
	};

	const showSignInOptions = () => {
		modalActions.show({
			id: 'signInOptions',
			component: SignInOptions,
			animateDirection: AnimateDirections.BottomLeft,
		});
	};

	const onQuickThreadPress = () => {
		if (profile.id) {
			modalActions.show({
				id: 'EditingModal',
				component: Editing,
				bindingDirection: BindDirections.Bottom,
				withoutMask: true,
				context: {
					isThreadEditing: true,
				},
			});
		} else {
			showSignInOptions();
		}
	};

	const onSearchPress = () => {
		setIsSearchModalVisible(true);
	};
	const onCloseSearchModal = () => {
		setIsSearchModalVisible(false);
	};

	useEffect(() => {
		setTimeout(() => {
			setSimpleThreads(threads);
		}, 1000);
	}, []);

	return (
		<View style={styles.mainContainer}>
			<FlatList
				style={styles.container}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View>
						<Modal visible={isSearchModalVisible} animationType={'slide'}>
							<SearchModal onCancelSearchModal={onCloseSearchModal} />
						</Modal>
						<ControllerRow
							onAvatarPress={onAvatarPress}
							onSearchPress={onSearchPress}
						/>
						<TouchableOpacity
							style={styles.quickThreadContainer}
							onPress={onQuickThreadPress}
						>
							<Text style={styles.placeHolderText}>
								What{"'"}s your thoughts
							</Text>
						</TouchableOpacity>
						<View style={styles.activityIndicatorContainer}>
							{simpleThreads.length === 0 && <ActivityIndicator />}
						</View>
					</View>
				}
				ListFooterComponent={<View style={styles.footer} />}
				data={data?.feedThreads}
				renderItem={({ item }) => <Post item={item} />}
				keyExtractor={(item) => item.id}
			/>
		</View>
	);
};

export default BuildDashboard;

const styles = StyleSheet.create({
	placeHolderText: {
		color: grey,
		fontSize: 16,
		fontWeight: '400',
	},
	footer: { height: 24 },
	activityIndicatorContainer: {
		marginTop: 5,
	},
	container: {
		width: '100%',
		maxWidth: MAX_WIDTH,
		alignSelf: 'center',
		paddingTop: 32,
		paddingHorizontal: 15,
		backgroundColor: blackPearl,
	},
	quickThreadContainer: {
		marginTop: 10,
		backgroundColor: blueWhale,
		justifyContent: 'center',
		paddingLeft: 15,
		paddingVertical: 14,
		borderRadius: 10,
	},
	mainContainer: { flex: 1, alignItems: 'center', backgroundColor: blackPearl },
});
