export interface Note {
    note_id: number;
    note_title: string;
    note_content: string;
    note_creator_id: number;
    note_URLs: Array<string>;
    note_type: string;  // 这是用来存甚么   帖子内容分类   那图片和视频怎么区分？
    like_counts: number;
    collect_counts: number;
    note_tag_list: Array<any>;
    note_update_time: string;
    comment_counts: number;
    is_finding_buddy:number,
    buddy_description:string,
    view_count:number,
    username: string;
    avatar: string;
    isFollow: boolean,
    isLike: boolean,
    isCollection: boolean,
    noteType:string,
    video:string,
  }