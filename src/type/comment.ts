export interface Comment{
    comment_id:number,
    note_id:number,
    creator_id:number,
    parent_id:number,
    reply_id:number,
    reply_uid:number,
    level:number,
    content:string,
    created_at:string,
    comment_like:number,
    creator_avatar:string,
    creator_username:string,
}