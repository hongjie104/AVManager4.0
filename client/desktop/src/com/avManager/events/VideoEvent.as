package com.avManager.events
{
	import com.avManager.model.data.Video;
	
	import org.libra.events.BaseEvent;
	
	public final class VideoEvent extends BaseEvent
	{
		
		public static const VIDEO_EVENT:String = "MyVideoEvent"; 
		
		public static const SHOW_DETAIL:String = "showDetail";
		
		private var _video:Video;
		
		public function VideoEvent(subType:String, video:Video=null)
		{
			super(VIDEO_EVENT, subType, data);
			_video = video;
		}

		public function get video():Video
		{
			return _video;
		}

		public function set video(value:Video):void
		{
			_video = value;
		}

	}
}