# app/controllers/state_controller.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class StatesController < ApplicationController

  def index
    @device = Device.find(params[:device_id])
    @states = State.where(device_id: @device.id).sort(c_at: -1).
      find_all.all.page params[:page]
  end

end

# vim:ts=2 sts=2 sw=2 et: