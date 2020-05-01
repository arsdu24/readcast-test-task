import { register } from './main';

module.exports = (bp: any) => {
    register()(bp)

    bp.hear(/\/forget/i, async (event: { user: { id: any; }; }) => {
        await bp.users.untag(event.user.id, 'nickname')
    });

    bp.hear({ type: /text|message|quick_reply/i }, (event: { sessionId: any; user: { id: any; }; }) => {
        bp.dialogEngine.processMessage(event.sessionId || event.user.id, event).then()
    });
}