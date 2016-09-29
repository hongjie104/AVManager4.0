package com.avManager
{
	import com.avManager.model.Config;
	
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import org.libra.utils.MathUtil;

	public final class Utils
	{
		
		private static var loader:URLLoader = new URLLoader();
		
		private static var fetchMagnetCallBack:Function = null;
		
		private static var thisArg:Object = null;
		
		public function Utils()
		{
		}
		
		public static function fetchVideoDataFromHtml(html:String):Object{
			// <span style="color:#CC0000;">MOJ-305</span></p>
			var code:String = html.match(/<span style="color:#CC0000;">.*<\/span><\/p>/)[0].toString().replace('<span style="color:#CC0000;">', '').replace('<\/span><\/p>', '');
			// <h3>MOJ-305 淫語で誘うベロちゅう痴女 あなたのザーメン管理してあげるから勝手に射精したら許さないから… 波多野結衣</h3>
			var name:String = html.match(/<h3>.*<\/h3>/)[0].toString().replace(/<\/?h3>/g, '');
			var dateString:String = html.match(/\d{4}-\d{2}-\d{2}/)[0];
			var arr:Array = dateString.split("-");
			arr[1] = int(arr[1]) - 1;
			dateString = arr.join("-");
			// <span class="genre"><a href="https://www.javbus.me/genre/f">單體作品</a></span>
			var category:Vector.<String> = new Vector.<String>();
			arr = html.match(/<span class="genre">.*<\/span>/g);
			for each(var s:String in arr){
				if(s.indexOf('target="_blank" rel="nofollow"') == -1){
					category.push(s.replace(/<span class="genre"><a href=".*">/, "").replace("</a></span>", ""));
				}
			}
			// <p><span class="header">系列:</span> <a href="https://www.javbus.me/series/fc6">3日間滞在して、寝食を共にする超高級美女ソープ</a></p>
			var series:String = "undefined";
			arr = html.match(/<p><span class="header">系列:<\/span> <a href=.*<\/a><\/p>/);
			if(arr && arr.length > 0){
				series = arr[0].toString().replace(/<p><span class="header">系列:<\/span> <a href=".*">/, "").replace("</a></p>", "");	
			}
			
			// <span class="genre" onmouseover="hoverdiv(event,'star_9oc')" onmouseout="hoverdiv(event,'star_9oc')">
			// <a href="https://www.javbus.me/star/9oc">西川ゆい</a>
			var actress:Vector.<String> = new Vector.<String>();
			arr = html.match(/<span class="genre" onmouseover.*\r*\n*\s*<a href=.*<\/a>/g);
			for each(s in arr){
				actress.push(s.replace(/<span class="genre" onmouseover.*\r*\n*\s*<a href=.*">/, "").replace("</a>", ""));
			}
			return {
				code: code,
				name: name,
				dateString: dateString,
				actress: actress,
				category: category,
				series: series
			};
		}
		
		public static function fetchMagnet(videoCode:String, cb:Function, thisArg:Object):void{
			fetchMagnetCallBack = cb;
			Utils.thisArg = thisArg;
			loader.addEventListener(Event.COMPLETE, onLoadVideoHtml);
			loader.load(new URLRequest(Config.instance.webURL + "/" + videoCode));
		}
		
		private static function onLoadVideoHtml(evt:Event):void{
			var gid:String = "";
			var uc:String = "";
			var img:String = "";
			
			loader.removeEventListener(Event.COMPLETE, onLoadVideoHtml);
			
			var result:Array = (/var gid = \d+/).exec(loader.data);
			if(result && result.length > 0) {
				gid = result[0].toString().replace("var gid = ", "");
				result = (/var uc = \d+/).exec(loader.data);
				if(result && result.length > 0) {
					uc = result[0].toString().replace("var uc = ", "");
					result = (/var img = '.*'/).exec(loader.data);
					if(result && result.length > 0) {
						img = result[0].toString().replace("var img = '", "").replace("'", "");
						
						loader.addEventListener(Event.COMPLETE, onLoadMagnet);
						// "https://www.javbus5.com/ajax/uncledatoolsbyajax.php?gid=32451078852&lang=zh&img=https://pics.javbus.info/cover/5p4b_b.jpg&uc=0&floor=359"
						loader.load(new URLRequest(Config.instance.webURL + "/ajax/uncledatoolsbyajax.php?gid=" + gid + "&lang=zh&img=" + img + "&uc=" + uc + "&floor=" + Math.floor(MathUtil.random(100, 999))));
					}
				}
			}
		}
		
		private static function onLoadMagnet(evt:Event):void{
			loader.removeEventListener(Event.COMPLETE, onLoadMagnet);
			
			var magnetList:Array = [];
			if(loader.data.indexOf("暫時沒有磁力連結") == -1){
				var arr:Array = loader.data.match(/<a style="color:#333" rel="nofollow".*>\r*\n*.*<\/a>/g);
				for(var i:int = 0; i < arr.length; i += 3) {
					magnetList.push({
						"name":arr[i].toString().replace(/<a.*">/, "").replace(/\r*\n*\s*\t*/g, "").replace("</a>", ""),
						"size":arr[i + 1].toString().replace(/<a.*">/, "").replace(/\r*\n*\s*\t*/g, "").replace("</a>", ""),
						"date":arr[i + 2].toString().replace(/<a.*">/, "").replace(/\r*\n*\s*\t*/g, "").replace("</a>", ""),
						"url":arr[i].toString().match(/href=".*"/)[0].toString().replace("href=\"", "").replace("\"", "")
					});
				}
			}
			fetchMagnetCallBack.call(thisArg, magnetList);
		}
	}
}