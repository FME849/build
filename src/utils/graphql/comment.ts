import { accountState } from 'utils/state/account';
import { CreateCommentInput } from 'utils/types';
import { snapshot } from 'valtio';

import { graphQlClient } from './internal';
import * as mutations from './mutation';
import * as queries from './query';

export const createComment = async (
	item: CreateCommentInput,
	threadId: string,
) => {
	const { profile } = snapshot(accountState);
	const { avatarUrl, address, id, name } = profile;
	const { parentId, body, replyId } = item;
	const time = new Date().toISOString();

	await graphQlClient.mutate({
		mutation: mutations.createComment,
		variables: {
			input: {
				parentId,
				body,
				replyId,
			},
		},
		update: (cache, { data }) => {
			console.log('start');
			cache.modify({
				id: `Thread:${threadId}`,
				fields: {
					comments(existingComments = []) {
						const newCommentRef = cache.writeFragment({
							data: data?.createComment,
							fragment: queries.commentFields,
						});
						console.log([...existingComments, newCommentRef]);
						return [...existingComments, newCommentRef];
					},
				},
			});
		},
		optimisticResponse: {
			createComment: {
				id: 'temp-id',
				__typename: 'Comment',
				body,
				owner: {
					avatarUrl,
					address,
					name,
					id,
				},
				reply: null,
				upCount: 0,
				timestamp: time,
			},
		},
	});
};
