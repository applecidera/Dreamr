import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { merge } from 'lodash';

class PostForm extends React.Component {
	constructor(props) {
		super(props);
		const { postType, currentUser } = this.props;
		this.state = {
			user_id: currentUser.id,
			postType: postType,
			title: '',
			text: '',
			imageFiles: null,
			imageUrls: null,
			tags: '',
			errors: null,
			allowSubmit: true
		};
		this.ref = React.createRef();
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleUpload = this.handleUpload.bind(this);
		this.deletePreviewImage = this.deletePreviewImage.bind(this);
	}

	handleInput(inputType){
		return e=>{
			this.setState({
				[inputType]: e.currentTarget.value
			})
		}
	}

	handleUpload(e){
		// filesize must be under 5mb cuz im too poor to afford AWS

		//REVIEW Multi Upload

		const that = this;
		let imageFileArray=[];
		let imageUrlArray=[];
		if (this.state.imageFiles != null){
			imageFileArray = imageFileArray.concat(this.state.imageFiles);
			imageUrlArray = imageUrlArray.concat(this.state.imageUrls);
		}
		let uploadedImages = e.currentTarget.files;
		for (let i=0; i < uploadedImages.length; i++){
			const file = uploadedImages[i];
			const fileReader = new FileReader();
	
			if (file.size > 5000000){
				that.setState({errors: "Filesize must be under 5 Mb!"});
			} else {
				// TODO redo this logic with filreader url
				fileReader.onloadend = ()=> {	// loads fileReader while setting state
					imageFileArray = imageFileArray.concat(file);
					imageUrlArray = imageUrlArray.concat(fileReader.result);
					that.setState({
						imageFiles: imageFileArray,
						imageUrls: imageUrlArray
					})
				}
			}

			if (file) fileReader.readAsDataURL(file);	// renders image if file exists
		}

	}
	
	handleSubmit(e) {
		
		let post_type;
		switch ( this.props.postType || this.props.postBarType) {
			case "textForm":
				post_type = "text";
				break;
			case "imageForm":
				post_type = "image";
				break;
			case "quoteForm":
				post_type = " quote";
				break;
			case "audioForm":
				post_type = "audio"
				break;
			case "videoForm":
				post_type = "video"
				break;
			default:
				post_type = "";
				break;
		}

		// Multi Image Submit
		console.log(post_type);
		if (this.state.allowSubmit){	// prevents multi submit

			this.setState({allowSubmit: false});			
			e.preventDefault();
			const formData = new FormData();
			formData.append('post[title]', this.state.title);
			let imageFiles = this.state.imageFiles;
			if (imageFiles) {
				imageFiles.forEach((image, idx)=>{
					formData.append('post[images][]', imageFiles[idx]);
				})
			}
			formData.append('post[text]', this.state.text);
			formData.append('post[tags]', this.state.tags);
			formData.append('post[post_type]', post_type);
			
			const closeModalCB = ()=>this.props.closeModal();
			let rerouting;	// if created from bar, go back upon success	
			if (this.props.postBarType)	rerouting = () => this.props.history.goBack();
			
			this.props
				.createPost(formData)
				.then(
					(rerouting),
					(response)=>console.log(response.responseJSON)
				).then(closeModalCB);
				// .then(() => this.props.history.push('/dashboard'));
		}
	}

	deletePreviewImage(idx){
		let index = idx.idx;
		// debugger
		// this.setState=({
		// 	imageUrls[idx]: {},
		// 	imageFiles[idx]: {}
		// })
		
		// delete this.state.imageUrls[index]
		// delete this.state.imageFiles[index]
		// console.log(this.state.imageFiles);
		// this.forceUpdate()
		let imageUrls = this.state.imageUrls.slice();
		let imageFiles = this.state.imageFiles.slice();
		//TODO SPLICE INDEX, number of items
		imageUrls.splice(index,1);
		imageFiles.splice(index,1);

		if (imageUrls.length===0) imageUrls = null;
		if (imageUrls.length===0) imageFiles = null;

		this.setState({
			imageUrls: imageUrls,
			imageFiles: imageFiles
		})

	}



	render() {
		//TODO Destructure Props Here
		const {closeModal, currentUser, postType, postBarType} = this.props;
		const {title, text, imageFiles}=this.state;
	
		// TODO Conditional Formblock Insertions
		let placeholderText;

		switch (postType || postBarType) {
			case "textForm":
				placeholderText = "Your text here";
				break;
			case "imageForm":
				placeholderText = "Add a caption, if you like";
				break;
			case "quoteForm":
				placeholderText = " - Source";
				break;
			case "audioForm":
				placeholderText = "Add a description, if you like";
				break;
			case "videoForm":
				placeholderText = "Add a caption, if you like"
				break;
			default:
				placeholderText = "";
				break;
		}
		// let titleGoesHere=null;
		// if (postType === "textForm" || postType === "quoteForm" ){
			const titleGoesHere=(
			<input 
				type="text" 
				placeholder="Title"
				className="input-title"
				onChange={this.handleInput("title")} />);
		// }
		// let imageUploadBox=null;
		// if (postType === "imageForm"){
			const imagePreviews = this.state.imageUrls ? 	// if
			( this.state.imageUrls.map((imageUrl, idx)=>{
				return (<div key={idx} className="image-preview-box">
					<img className="image-preview" src={imageUrl} />
					<i className="fas fa-times-circle delete-preview"
						onClick={()=>this.deletePreviewImage({idx})}></i>
					</div>)
				})
			) :	// then
			null;	// else

			const uploadImageLabelHeight = (this.state.imageFiles != null) ? ("add-more-photos") : ("regular-height")
			const uploadImageLabelText = (this.state.imageFiles != null) ? ("Add more photos") : ("Upload Photos!")
			const uploadImageHiddenInput = (this.state.imageFiles != null) ? ("small-hidden-upload-button") : ("large-hidden-upload-button")
			const imageUploadBox=(
				<div className="image-upload-box">
					{imagePreviews}
					<label 
					htmlFor="upload-box"
					className="upload-label-box"
					id={uploadImageLabelHeight}>
						<div className="camera-icon-text-container">
							<div className="camera-icon fas fa-camera" />
							<div>{uploadImageLabelText}</div>
						</div>
						<input
						type="file"
						id="upload-box"
						className={uploadImageHiddenInput}
						onChange={this.handleUpload}
						multiple/>
					</label>
				</div>
			)
		// }
			
			const textGoesHere=(
				<textarea cols="30" rows="4" 
				placeholder={placeholderText}
				className="input-body"
				elastic="true"
				onChange={this.handleInput("text")}></textarea>
			)

			const tagsGoesHere=(
				<input 
				type="text" 
				placeholder="#tags"
				className="input-tags"
				onChange={this.handleInput("tags")}/>
			)

			const quoteGoesHere=(
				<input 
				type="text" 
				placeholder="&quot;Quote&quot;"
				className="input-quote"
				onChange={this.handleInput("title")}/>
			)

		// Final Building of Formblock
		let formBlock;
		switch (this.state.postType || this.props.postBarType) {
			case 'textForm':
				formBlock = (
					<div className = "formData">
						{titleGoesHere}
						{textGoesHere}
						{tagsGoesHere}
					</div>
				);
				break;
			case 'imageForm':
				formBlock = (
					<div className = "formData">
						{imageUploadBox}
						{textGoesHere}
						{tagsGoesHere}
					</div>
				);
				break;
			case 'quoteForm':
				formBlock = (
					<div className = "formData">
						{quoteGoesHere}
						{textGoesHere}
						{tagsGoesHere}
					</div>
				);
				break;
			case 'audioForm':
				formBlock = (
					<div className = "formData">
						{imageUploadBox}
						{textGoesHere}
						{tagsGoesHere}
					</div>
				);
				break;
			case 'videoForm':
				formBlock = (
					<div className = "formData">
						{imageUploadBox}
						{textGoesHere}
						{tagsGoesHere}
					</div>
				);
				break;
		}
		
		let disabled=true;
		// TODO add more conditions that disable Post button
		if (title!="" || text!="" || imageFiles!=null) {disabled=false} else {disabled=true};

		let bottomBlock;
		if (this.props.postBarType){ // Post was instantiated from post-bar
			bottomBlock=(<div className="post-form-bottom-block">
				<Link to="/dashboard"><button className="post-close">Close</button></Link>
				<button disabled={disabled} className="post-create-post" onClick={this.handleSubmit}>
					<span>Post</span>
					<div className="fas fa-chevron-down"></div>
				</button>
			</div>)
		} else {		// Post was instantiated from modal
			bottomBlock=(<div className="post-form-bottom-block">
				<button className="post-close" onClick={closeModal}>Close</button>
				<button disabled={disabled} className="post-create-post" onClick={this.handleSubmit}>
					<span>Post</span>
					<div className="fas fa-chevron-down"></div>
				</button>
			</div>)
		}

		return (
			<>
				<img className="avatar" src={window.avatar} />
				<div className="post-form-box postbox">
					<div className="post-form-top-block">{currentUser.username}</div>
						{formBlock}
					{bottomBlock}
				</div>
			</>
		);
	}
}

export default withRouter(PostForm);
