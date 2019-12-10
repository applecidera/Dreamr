class ApplicationController < ActionController::Base

  helper_method :current_user, :logged_in?

  def current_user
    # @current_user = User.find_by(session: [:session_token])
    # @current_user ? current_user : nil
    return nil unless session[:session_token]

    # Return the user associated with the session_token (if token is valid)
    @current_user ||= User.find_by_session_token(session[:session_token])
  end

  def logged_in?
    !!current_user
  end

  def login!(user)
    session[:session_token] = user.session_token
  end

  def logout!
    current_user.reset_session_token!
    session[:session_token] = nil
  end

  # def ensure_logged_in

  # end

  # def ensure_logged_out

  # end

end
