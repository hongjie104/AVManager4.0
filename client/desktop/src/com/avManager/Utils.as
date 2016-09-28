package com.avManager
{
	public final class Utils
	{
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
	}
}