# app/controllers/user_controller.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class UsersController < ApplicationController
  before_action :correct_user,   only: [:update]

  def index
    unless current_user.admin?
      redirect_to user_path(current_user)
    end
    @users = User.page params[:page]
  end

  def show
    unless admin_or_self
      redirect_to user_path(current_user)
    end
    @user = User.find(params[:id])
  end

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    if @user.save
      flash[:success] = t '.success'
      redirect_to user_path(@user)
    else
      flash.now[:danger] = I18n.t :error_msg, count:@user.errors.count
      render 'new'
    end
  end

  def update
    @user = User.find(params[:id])
    if @user.update_attributes(user_params)
      flash[:success] = "Изменено успешно"
      redirect_to @user
    else
      flash.now[:danger] = "#{I18n.t :error_msg, count:@user.errors.count}"
      render 'show'
    end
  end

  private

    def user_params
      list=['name', 'email', 'password', 'password_confirmation']
      if current_user.admin? && current_user.id.to_s != params[:id]
        list.push('admin')
      end
      params.require(:user).permit(list)
    end

    def admin_or_self
      current_user.admin? || current_user.id.to_s == params[:id]
    end

    def correct_user
      if !admin_or_self || (params[:user][:admin] && !current_user.admin?)
        sign_out
        redirect_to(signin_path)
      end
    end
end

# vim:ts=2 sts=2 sw=2 et:
