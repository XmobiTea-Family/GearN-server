export class DisplayNameUtility {
	public static normalizeString(input: string): string {
		if (!input) return "";

		let inputReturn = "";
		input = input.toLowerCase();

		for (let i = 0; i < input.length; i++) {
			let char = input[i];

			if (
				char == "a" ||
				char == "á" ||
				char == "à" ||
				char == "ả" ||
				char == "ã" ||
				char == "ạ" ||
				char == "ắ" ||
				char == "ằ" ||
				char == "ẳ" ||
				char == "ẵ" ||
				char == "ặ" ||
				char == "ấ" ||
				char == "ầ" ||
				char == "ẩ" ||
				char == "ẫ" ||
				char == "ậ"
			)
				inputReturn += "a";
			else if (char == "b") inputReturn += "b";
			else if (char == "c") inputReturn += "c";
			else if (char == "d" || char == "đ") inputReturn += "d";
			else if (
				char == "e" ||
				char == "é" ||
				char == "è" ||
				char == "ẻ" ||
				char == "ẽ" ||
				char == "ẹ" ||
				char == "ế" ||
				char == "ề" ||
				char == "ể" ||
				char == "ễ" ||
				char == "ệ"
			)
				inputReturn += "e";
			else if (char == "f") inputReturn += "f";
			else if (char == "g") inputReturn += "g";
			else if (char == "h") inputReturn += "h";
			else if (char == "i" || char == "í" || char == "ì" || char == "ỉ" || char == "ĩ" || char == "ị") inputReturn += "i";
			else if (char == "j") inputReturn += "j";
			else if (char == "k") inputReturn += "k";
			else if (char == "l") inputReturn += "l";
			else if (char == "m") inputReturn += "m";
			else if (char == "n") inputReturn += "n";
			else if (
				char == "o" ||
				char == "ó" ||
				char == "ò" ||
				char == "ỏ" ||
				char == "õ" ||
				char == "ọ" ||
				char == "ớ" ||
				char == "ờ" ||
				char == "ở" ||
				char == "ỡ" ||
				char == "ợ" ||
				char == "ố" ||
				char == "ồ" ||
				char == "ổ" ||
				char == "ỗ" ||
				char == "ộ"
			)
				inputReturn += "o";
			else if (char == "p") inputReturn += "p";
			else if (char == "q") inputReturn += "q";
			else if (char == "r") inputReturn += "r";
			else if (char == "s") inputReturn += "s";
			else if (char == "t") inputReturn += "t";
			else if (
				char == "u" ||
				char == "ú" ||
				char == "ù" ||
				char == "ủ" ||
				char == "ũ" ||
				char == "ụ" ||
				char == "ứ" ||
				char == "ừ" ||
				char == "ử" ||
				char == "ữ" ||
				char == "ự"
			)
				inputReturn += "u";
			else if (char == "v") inputReturn += "v";
			else if (char == "w") inputReturn += "w";
			else if (char == "x") inputReturn += "x";
			else if (char == "y" || char == "ý" || char == "ỳ" || char == "ỷ" || char == "ỹ" || char == "ỵ") inputReturn += "y";
			else if (char == "z") inputReturn += "z";
		}

		return inputReturn;
	}
}
