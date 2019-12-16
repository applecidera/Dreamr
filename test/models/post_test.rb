# == Schema Information
#
# Table name: posts
#
#  id               :bigint           not null, primary key
#  original_post_id :integer
#  title            :string
#  text             :text
#  content_url      :string
#  tags             :string
#  user_id          :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  post_type        :string           not null
#

require 'test_helper'

class PostTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
